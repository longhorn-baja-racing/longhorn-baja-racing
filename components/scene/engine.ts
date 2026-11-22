import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { buildCar, groupKeys, groupSpec, type GroupKey } from "./car"
import { createDust, createTerrain } from "./environment"
import { shots, type Shot } from "./shots"

/*
  One WebGL scene for the home page. The page scrolls; this file never moves the
  DOM. It reads the positions of [data-shot] anchors once per layout change, then
  each frame blends the two shots around the middle of the screen and eases the
  camera and car toward them.

  Performance: one renderer, merged geometry, GPU-only particles, rendering only
  while a scene section is on screen, and pixel ratio that steps down if frames run slow.
*/

export type EngineOptions = {
  host: HTMLElement
  track: HTMLElement
  callout: HTMLElement | null
  reducedMotion: boolean
  lowPower: boolean
  /** Run even on a software renderer (for testing). */
  force: boolean
  onReady: () => void
  onLost: () => void
}

export type Engine = { dispose: () => void }

const BG = 0x0a0908
/** Shots are authored close to the car; this pulls every camera back to frame it. */
const DIST = 1.6
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => x * x * (3 - 2 * x)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)

type Pose = {
  radius: number
  theta: number
  phi: number
  target: THREE.Vector3
  explode: number
  xray: number
  drive: number
  sx: number
  sy: number
  lit: Record<GroupKey, number>
  edge: Record<GroupKey, number>
  label: string
  focus: GroupKey | null
}

function emptyPose(): Pose {
  return {
    radius: 4, theta: 0, phi: 1, target: new THREE.Vector3(), explode: 0, xray: 0, drive: 0, sx: 0, sy: 0,
    lit: Object.fromEntries(groupKeys.map((k) => [k, 1])) as Record<GroupKey, number>,
    edge: Object.fromEntries(groupKeys.map((k) => [k, 0])) as Record<GroupKey, number>,
    label: "", focus: null,
  }
}

const sph = new THREE.Spherical()
const offset = new THREE.Vector3()

/** Converts a shot to a pose for a viewport. */
function poseOf(shot: Shot, out: Pose, wide: boolean) {
  offset.set(shot.cam[0] - shot.target[0], shot.cam[1] - shot.target[1], shot.cam[2] - shot.target[2])
  sph.setFromVector3(offset)
  out.radius = sph.radius
  out.theta = sph.theta
  out.phi = sph.phi
  out.target.set(...shot.target)
  // A single spotlighted part flies out of the car; aim at where it ends up.
  if (shot.focus?.length === 1) {
    const e = groupSpec[shot.focus[0]].explode
    const k = shot.explode + 0.25
    out.target.add(offset.set(e[0] * k, e[1] * k + shot.explode * 0.22, e[2] * k))
  }
  out.explode = shot.explode
  out.xray = shot.xray
  out.drive = shot.drive
  if (shot.layout === "hero") [out.sx, out.sy] = wide ? [0.2, 0.05] : [0, 0.29]
  else [out.sx, out.sy] = wide ? [0.19, 0.02] : [0, -0.21]
  for (const k of groupKeys) {
    const inFocus = !shot.focus || shot.focus.includes(k)
    out.lit[k] = inFocus ? 1 : 0
    out.edge[k] = shot.focus && inFocus ? 1 : shot.xray
  }
  out.label = shot.label ?? ""
  out.focus = shot.focus ? shot.focus[0] : null
  return out
}

function angleLerp(a: number, b: number, t: number) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

function blend(a: Pose, b: Pose, t: number, out: Pose) {
  out.radius = lerp(a.radius, b.radius, t)
  out.theta = angleLerp(a.theta, b.theta, t)
  out.phi = lerp(a.phi, b.phi, t)
  out.target.lerpVectors(a.target, b.target, t)
  out.explode = lerp(a.explode, b.explode, t)
  out.xray = lerp(a.xray, b.xray, t)
  out.drive = lerp(a.drive, b.drive, t)
  out.sx = lerp(a.sx, b.sx, t)
  out.sy = lerp(a.sy, b.sy, t)
  for (const k of groupKeys) {
    out.lit[k] = lerp(a.lit[k], b.lit[k], t)
    out.edge[k] = lerp(a.edge[k], b.edge[k], t)
  }
  const near = t < 0.5 ? a : b
  out.label = near.label
  out.focus = near.focus
  return out
}

/**
 * WebGL with a real GPU. Software rasterizers (no GPU, some VMs and CI) can draw
 * the scene but only at a few frames per second, so they get the static
 * background instead unless `force` is set.
 */
function webglSupported(force: boolean) {
  try {
    const c = document.createElement("canvas")
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null
    if (!gl) return false
    if (force) return true
    const info = gl.getExtension("WEBGL_debug_renderer_info")
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)
  } catch {
    return false
  }
}

export function createEngine(o: EngineOptions): Engine | null {
  if (!webglSupported(o.force)) return null
  const { host, track, callout, reducedMotion, lowPower } = o

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: false, powerPreference: "high-performance", stencil: false })
  } catch {
    return null
  }
  const maxDpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75)
  let dpr = maxDpr
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(BG, 1)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.setAttribute("aria-hidden", "true")
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const fog = new THREE.Fog(BG, 7.5, 17)
  scene.fog = fog
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envTex = pmrem.fromScene(room, 0.04).texture
  pmrem.dispose()
  room.traverse((obj) => {
    const m = obj as THREE.Mesh
    m.geometry?.dispose()
    ;(m.material as THREE.Material | undefined)?.dispose()
  })
  scene.environment = envTex
  scene.environmentIntensity = 0.55

  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x1a0d05, 0.85))
  const key = new THREE.DirectionalLight(0xffffff, 2.1)
  key.position.set(3, 5, 2)
  const rim = new THREE.DirectionalLight(0xff7a1a, 2.8)
  rim.position.set(-4, 2.2, -3)
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.35)
  fill.position.set(-1, 1.5, 4)
  scene.add(key, rim, fill)

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60)
  const car = buildCar()
  scene.add(car.root)
  const terrain = createTerrain()
  scene.add(terrain.mesh)
  const dust = createDust(lowPower ? 200 : 520)
  scene.add(dust.points)

  // --- Layout: anchors and viewport
  let width = 1, height = 1, wide = true
  let anchors: { y: number; pose: Pose }[] = []
  const measure = () => {
    width = Math.max(1, host.clientWidth)
    height = Math.max(1, host.clientHeight)
    wide = width >= 960
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // Pixels per world unit at distance 1, so dust sizes are in world units.
    dust.uniforms.uPixel.value = (height * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
    const scrollY = window.scrollY
    anchors = [...track.querySelectorAll<HTMLElement>("[data-shot]")]
      .map((el) => {
        const shot = shots[el.dataset.shot ?? ""]
        const r = el.getBoundingClientRect()
        return shot ? { y: r.top + scrollY + r.height / 2, pose: poseOf(shot, emptyPose(), wide) } : null
      })
      .filter((a): a is { y: number; pose: Pose } => a !== null)
      .sort((a, b) => a.y - b.y)
    invalidate()
  }

  const goal = emptyPose()
  const cur = emptyPose()
  const sampleGoal = () => {
    if (!anchors.length) return poseOf(shots.hero, goal, wide)
    const center = window.scrollY + window.innerHeight / 2
    if (center <= anchors[0].y) return blend(anchors[0].pose, anchors[0].pose, 0, goal)
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i], b = anchors[i + 1]
      if (center < b.y) {
        // Hold each shot while its copy is near the middle, then move.
        const t = smooth(clamp01(((center - a.y) / Math.max(1, b.y - a.y) - 0.2) / 0.6))
        return blend(a.pose, b.pose, t, goal)
      }
    }
    const last = anchors[anchors.length - 1].pose
    return blend(last, last, 0, goal)
  }

  // --- Input
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const finePointer = window.matchMedia("(pointer: fine)").matches && !reducedMotion
  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 0.14
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 0.06
  }
  if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true })

  // --- Loop
  let dirty = true
  const invalidate = () => { dirty = true }
  const onScroll = () => invalidate()
  window.addEventListener("scroll", onScroll, { passive: true })

  let raf = 0
  let running = false
  let last = 0
  let time = 0
  let flow = 0
  let frames = 0
  let slowTime = 0
  let ready = false
  let first = true
  const introStart = !reducedMotion && window.scrollY < window.innerHeight * 0.6
  let intro = introStart ? 0 : 1
  const v = new THREE.Vector3()
  let shownLabel = ""

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
    last = now
    const animating = !reducedMotion
    sampleGoal()
    if (first) {
      blend(goal, goal, 0, cur)
      first = false
    }

    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 4.2)
    let delta = 0
    const step = (a: number, b: number) => { const n = a + (b - a) * k; delta += Math.abs(b - a); return n }
    cur.radius = step(cur.radius, goal.radius)
    const dTheta = angleLerp(cur.theta, goal.theta, 1) - cur.theta
    cur.theta += dTheta * k
    delta += Math.abs(dTheta)
    cur.phi = step(cur.phi, goal.phi)
    delta += cur.target.distanceTo(goal.target)
    cur.target.lerp(goal.target, k)
    cur.explode = step(cur.explode, goal.explode)
    cur.xray = step(cur.xray, goal.xray)
    cur.drive = step(cur.drive, goal.drive)
    cur.sx = step(cur.sx, goal.sx)
    cur.sy = step(cur.sy, goal.sy)
    for (const g of groupKeys) {
      cur.lit[g] = step(cur.lit[g], goal.lit[g])
      cur.edge[g] = step(cur.edge[g], goal.edge[g])
    }
    cur.label = goal.label
    cur.focus = goal.focus
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3)
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3)
    if (intro < 1) intro = Math.min(1, intro + dt / 2.6)

    // Reduced motion: render only when something changed.
    if (!animating && !dirty && delta < 1e-4) return
    dirty = false

    if (animating) time += dt
    flow += cur.drive * dt * 2.4
    const introE = easeOut(intro)

    // Narrow screens need the camera further back to fit the car's width.
    const aspect = width / height
    const fit = aspect < 1.2 ? Math.min(2.1, Math.pow(1.2 / aspect, 0.85)) : wide ? 1 : 1.12
    sph.set(cur.radius * DIST * fit * (1 + (1 - introE) * 0.35), Math.min(1.52, Math.max(0.12, cur.phi - pointer.y)), cur.theta + pointer.x - (1 - introE) * 0.6)
    camera.position.setFromSpherical(sph).add(cur.target)
    // Fog follows the camera distance so far-back framings (portrait phones) stay lit.
    fog.near = sph.radius * 0.95
    fog.far = sph.radius * 2.4
    camera.lookAt(cur.target)
    camera.setViewOffset(width, height, -cur.sx * width, -cur.sy * height, width, height)

    const explode = Math.max(cur.explode, (1 - introE) * 0.85)
    const pulse = animating ? 0.75 + 0.25 * Math.sin(time * 3.2) : 1
    car.root.position.y = explode * 0.22 + (animating ? Math.sin(time * 1.4) * 0.004 * (1 - explode) : 0)
    for (const g of groupKeys) {
      const spec = groupSpec[g]
      const group = car.groups[g]
      const pop = cur.edge[g] * (1 - cur.xray) * 0.25
      const e = explode + pop
      group.object.position.set(spec.explode[0] * e, spec.explode[1] * e, spec.explode[2] * e)
      car.shade(g, cur.lit[g], cur.edge[g] * (cur.xray > 0.5 ? 0.85 : pulse), cur.xray)
      if (group.wheel && animating) group.wheel.rotation.z -= cur.drive * dt * 9
    }
    terrain.uniforms.uTime.value = time
    terrain.uniforms.uFlow.value = flow
    terrain.uniforms.uPulse.value = reducedMotion ? 0 : 1
    dust.uniforms.uTime.value = time
    dust.uniforms.uFlow.value = flow

    renderer.render(scene, camera)

    if (callout) {
      const focus = cur.focus
      const strength = focus ? cur.edge[focus] * (1 - cur.xray) : 0
      if (focus && strength > 0.05 && cur.label) {
        const a = groupSpec[focus].anchor
        v.set(a[0], a[1], a[2]).add(car.groups[focus].object.position).add(car.root.position).project(camera)
        const x = (v.x * 0.5 + 0.5) * width
        const y = (-v.y * 0.5 + 0.5) * height
        callout.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
        callout.toggleAttribute("data-flip", x > (wide ? width - 300 : width * 0.6))
        callout.style.opacity = String(clamp01((strength - 0.4) * 2.5))
        if (shownLabel !== cur.label) {
          shownLabel = cur.label
          const text = callout.querySelector("[data-callout-text]")
          if (text) text.textContent = cur.label
        }
      } else {
        callout.style.opacity = "0"
      }
    }

    if (!ready) {
      ready = true
      o.onReady()
    }

    // Adaptive resolution: if frames are slow, render fewer pixels.
    frames++
    slowTime += dt
    if (frames === 90) {
      const avg = slowTime / frames
      if (avg > 1 / 42 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25)
        renderer.setPixelRatio(dpr)
        measure()
      }
      frames = 0
      slowTime = 0
    }
  }

  const start = () => {
    if (running) return
    running = true
    last = 0
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  // Render only while a scene section is on screen.
  const visible = new Set<Element>()
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target)
      else visible.delete(e.target)
    }
    if (visible.size) start()
    else stop()
  })
  track.querySelectorAll("[data-scene-section]").forEach((el) => io.observe(el))

  const ro = new ResizeObserver(() => measure())
  ro.observe(track)
  ro.observe(host)
  const onResize = () => measure()
  window.addEventListener("resize", onResize)
  measure()
  start()

  const onLost = (e: Event) => {
    e.preventDefault()
    stop()
    o.onLost()
  }
  renderer.domElement.addEventListener("webglcontextlost", onLost)

  return {
    dispose() {
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pointermove", onPointer)
      renderer.domElement.removeEventListener("webglcontextlost", onLost)
      car.dispose()
      terrain.mesh.geometry.dispose()
      ;(terrain.mesh.material as THREE.Material).dispose()
      dust.points.geometry.dispose()
      ;(dust.points.material as THREE.Material).dispose()
      envTex.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

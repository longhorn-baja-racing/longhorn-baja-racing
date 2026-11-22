import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

/*
  Procedural Baja car, split into subsystem groups so the page can explode it and
  spotlight one subteam at a time. Geometry is merged per group and material, so
  the whole car is a few dozen draw calls. Swap in a GLB of the real assembly
  later by keeping the same group keys.
*/

export type V = [number, number, number]

export const groupKeys = ["chassis", "skid", "bodyL", "bodyR", "powertrain", "ergonomics", "electronics", "fl", "fr", "rl", "rr"] as const
export type GroupKey = (typeof groupKeys)[number]

/** Where each group travels in the exploded view, and the point a callout points at. */
export const groupSpec: Record<GroupKey, { explode: V; anchor: V }> = {
  chassis: { explode: [0, 0.15, 0], anchor: [-0.3, 1.38, 0.3] },
  skid: { explode: [0, -0.55, 0], anchor: [0.4, 0.24, 0.2] },
  bodyL: { explode: [0, 0.05, 0.85], anchor: [0.25, 0.45, 0.4] },
  bodyR: { explode: [0, 0.05, -0.85], anchor: [0.25, 0.45, -0.4] },
  powertrain: { explode: [-1.15, 0.45, 0], anchor: [-0.62, 0.5, -0.26] },
  ergonomics: { explode: [0.1, 1.1, 0], anchor: [-0.05, 0.62, 0.15] },
  electronics: { explode: [0.6, 1.6, 0], anchor: [0.5, 0.92, 0.08] },
  fl: { explode: [0.55, 0, 0.9], anchor: [0.72, 0.29, 0.78] },
  fr: { explode: [0.55, 0, -0.9], anchor: [0.72, 0.29, -0.78] },
  rl: { explode: [-0.55, 0, 0.9], anchor: [-0.72, 0.29, 0.76] },
  rr: { explode: [-0.55, 0, -0.9], anchor: [-0.72, 0.29, -0.76] },
}

const wheelCenters: Record<"fl" | "fr" | "rl" | "rr", V> = { fl: [0.72, 0.29, 0.68], fr: [0.72, 0.29, -0.68], rl: [-0.72, 0.29, 0.66], rr: [-0.72, 0.29, -0.66] }

type MatKey = "frame" | "steel" | "dark" | "spring" | "engine" | "seat" | "glow" | "glass" | "panel" | "tank" | "board" | "harness"

function baseMaterial(key: MatKey, panelMap: THREE.Texture | null): THREE.MeshStandardMaterial {
  switch (key) {
    case "frame": return new THREE.MeshStandardMaterial({ color: 0xe4e0d8, metalness: 0.35, roughness: 0.38 })
    case "steel": return new THREE.MeshStandardMaterial({ color: 0xa9afb5, metalness: 0.9, roughness: 0.28 })
    case "dark": return new THREE.MeshStandardMaterial({ color: 0x1b1b1c, roughness: 0.92 })
    case "spring": return new THREE.MeshStandardMaterial({ color: 0xff6a13, metalness: 0.45, roughness: 0.35 })
    case "engine": return new THREE.MeshStandardMaterial({ color: 0x34383d, metalness: 0.65, roughness: 0.45 })
    case "seat": return new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.75 })
    case "glow": return new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xff8a2a, emissiveIntensity: 1.6 })
    case "glass": return new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: 0.2, roughness: 0.5, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })
    case "panel": return new THREE.MeshStandardMaterial({ color: 0xffffff, map: panelMap, metalness: 0.15, roughness: 0.45, side: THREE.DoubleSide })
    case "tank": return new THREE.MeshStandardMaterial({ color: 0xbf5700, roughness: 0.4, metalness: 0.2 })
    case "board": return new THREE.MeshStandardMaterial({ color: 0x0f2c22, emissive: 0x22c55e, emissiveIntensity: 0.35 })
    case "harness": return new THREE.MeshStandardMaterial({ color: 0xff8a2a, emissive: 0xff6a13, emissiveIntensity: 0.6 })
  }
}

/** Livery for the side panels: burnt orange with a dark stripe and the team mark. */
function panelTexture() {
  const c = document.createElement("canvas")
  c.width = 512
  c.height = 256
  const g = c.getContext("2d")!
  const grad = g.createLinearGradient(0, 0, 512, 256)
  grad.addColorStop(0, "#d36612")
  grad.addColorStop(1, "#a94b00")
  g.fillStyle = grad
  g.fillRect(0, 0, 512, 256)
  g.fillStyle = "#151311"
  g.beginPath()
  g.moveTo(0, 176); g.lineTo(512, 120); g.lineTo(512, 150); g.lineTo(0, 206)
  g.fill()
  g.fillStyle = "#fff4e6"
  g.font = "800 64px system-ui, sans-serif"
  g.textBaseline = "middle"
  g.fillText("LBR", 40, 82)
  g.font = "600 20px system-ui, sans-serif"
  g.fillText("LONGHORN BAJA RACING", 44, 126)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Frame tubes as [start, end, radius], ordered bottom-up like a frame being jigged. */
export function frameMembers(): [V, V, number][] {
  const mirror = (p: V): V => [p[0], p[1], -p[2]]
  const N = {
    rearLow: [-0.85, 0.32, 0.3] as V,
    midLow: [-0.2, 0.25, 0.36] as V,
    frontLow: [0.75, 0.3, 0.22] as V,
    nose: [1.0, 0.48, 0.15] as V,
    hoopShoulder: [-0.24, 0.95, 0.38] as V,
    hoopTop: [-0.32, 1.38, 0.3] as V,
    roofFront: [0.28, 1.3, 0.27] as V,
    frontBrace: [0.68, 0.85, 0.22] as V,
    sideRear: [-0.21, 0.62, 0.38] as V,
    sideFront: [0.62, 0.62, 0.25] as V,
    rearUp: [-0.85, 0.78, 0.28] as V,
  }
  const side: [V, V][] = [
    [N.rearLow, N.midLow], [N.midLow, N.frontLow], [N.frontLow, N.nose],
    [N.midLow, N.sideRear], [N.sideRear, N.hoopShoulder], [N.hoopShoulder, N.hoopTop],
    [N.hoopTop, N.roofFront], [N.roofFront, N.frontBrace], [N.frontBrace, N.frontLow],
    [N.sideRear, N.sideFront], [N.sideFront, N.frontLow], [N.frontBrace, N.nose],
    [N.hoopShoulder, N.rearUp], [N.rearUp, N.rearLow], [N.sideRear, N.rearUp],
    [N.roofFront, N.sideFront], [N.midLow, N.sideFront],
  ]
  const out: [V, V, number][] = []
  for (const [a, b] of side) {
    out.push([a, b, 0.017])
    out.push([mirror(a), mirror(b), 0.017])
  }
  for (const p of [N.rearLow, N.midLow, N.frontLow, N.nose, N.hoopShoulder, N.hoopTop, N.roofFront, N.frontBrace, N.rearUp, N.sideFront]) {
    out.push([p, mirror(p), 0.017])
  }
  out.push([N.hoopTop, mirror(N.hoopShoulder), 0.013])
  out.push([N.rearUp, mirror(N.rearLow), 0.013])
  return out.sort((m1, m2) => (m1[0][1] + m1[1][1]) - (m2[0][1] + m2[1][1]))
}

const UP = new THREE.Vector3(0, 1, 0)
const dummy = new THREE.Object3D()

function placed(geo: THREE.BufferGeometry, pos: V, rot: V = [0, 0, 0], quat?: THREE.Quaternion) {
  dummy.position.set(...pos)
  if (quat) dummy.quaternion.copy(quat)
  else dummy.rotation.set(...rot)
  dummy.scale.set(1, 1, 1)
  dummy.updateMatrix()
  return geo.applyMatrix4(dummy.matrix)
}

function tubeGeo(a: V, b: V, r: number, radial = 10) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b)
  const d = vb.clone().sub(va)
  const geo = new THREE.CylinderGeometry(r, r, d.length(), radial, 1, false)
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.normalize())
  return placed(geo, va.add(vb).multiplyScalar(0.5).toArray() as V, undefined, q)
}

function coilGeo(a: V, b: V) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b)
  const d = vb.clone().sub(va), len = d.length()
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 108; i++) {
    const t = i / 108, ang = t * Math.PI * 2 * 9
    pts.push(new THREE.Vector3(Math.cos(ang) * 0.036, len * (0.14 + t * 0.62), Math.sin(ang) * 0.036))
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 216, 0.0075, 6)
  return placed(geo, va.toArray() as V, undefined, new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()))
}

/** Flat quad through four points (counter-clockwise), with 0..1 UVs; flipU mirrors the texture. */
function quadGeo(p: V[], flipU = false) {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p.flat(), 3))
  const u = flipU ? [1, 0, 0, 1] : [0, 1, 1, 0]
  geo.setAttribute("uv", new THREE.Float32BufferAttribute([u[0], 0, u[1], 0, u[2], 1, u[3], 1], 2))
  geo.setIndex([0, 1, 2, 0, 2, 3])
  geo.computeVertexNormals()
  return geo
}

function wheelGeometries() {
  const tire: THREE.BufferGeometry[] = [new THREE.TorusGeometry(0.21, 0.088, 12, 40)]
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    tire.push(placed(new THREE.BoxGeometry(0.05, 0.032, 0.05), [Math.cos(a) * 0.29, Math.sin(a) * 0.29, i % 2 ? 0.045 : -0.045], [0, 0, a]))
  }
  const rim: THREE.BufferGeometry[] = [placed(new THREE.CylinderGeometry(0.15, 0.15, 0.13, 28), [0, 0, 0], [Math.PI / 2, 0, 0])]
  for (let k = 0; k < 5; k++) {
    const a = (k * Math.PI * 2) / 5
    rim.push(placed(new THREE.CylinderGeometry(0.014, 0.014, 0.15, 8), [Math.cos(a) * 0.065, Math.sin(a) * 0.065, 0], [Math.PI / 2, 0, 0]))
  }
  return { tire: mergeGeometries(tire.map(stripToCommon)), rim: mergeGeometries(rim.map(stripToCommon)) }
}

/** mergeGeometries needs identical attribute sets; keep position, normal, uv. */
function stripToCommon(geo: THREE.BufferGeometry) {
  for (const name of Object.keys(geo.attributes)) if (!["position", "normal", "uv"].includes(name)) geo.deleteAttribute(name)
  if (!geo.attributes.uv) geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2))
  if (!geo.index) return geo
  const flat = geo.toNonIndexed()
  geo.dispose()
  return flat
}

export type CarGroup = {
  key: GroupKey
  object: THREE.Group
  materials: { mat: THREE.MeshStandardMaterial; color: THREE.Color; emissive: number; env: number }[]
  edges: THREE.LineBasicMaterial
  wheel?: THREE.Group
}

export type Car = {
  root: THREE.Group
  groups: Record<GroupKey, CarGroup>
  /** Dim (0) or light (1) a group, light its edges (0-1), and blend toward the x-ray look (0-1). */
  shade: (key: GroupKey, lit: number, edges: number, xray: number) => void
  dispose: () => void
}

export function buildCar(edgeColor: THREE.ColorRepresentation = 0xff8a2a): Car {
  const buckets: Record<GroupKey, Partial<Record<MatKey, THREE.BufferGeometry[]>>> = Object.fromEntries(groupKeys.map((k) => [k, {}])) as never
  const lines: Record<GroupKey, number[]> = Object.fromEntries(groupKeys.map((k) => [k, []])) as never
  const add = (group: GroupKey, mat: MatKey, geo: THREE.BufferGeometry) => {
    ;(buckets[group][mat] ??= []).push(stripToCommon(geo))
  }
  const line = (group: GroupKey, a: V, b: V) => lines[group].push(...a, ...b)

  // Chassis: tubes plus a stick-model outline for the x-ray view.
  for (const [a, b, r] of frameMembers()) {
    add("chassis", "frame", tubeGeo(a, b, r))
    line("chassis", a, b)
  }
  add("skid", "steel", placed(new THREE.BoxGeometry(1.75, 0.012, 0.62), [0.05, 0.235, 0]))

  // Body panels on each side of the cockpit.
  const panel = (s: 1 | -1): V[] => [[-0.2, 0.27, 0.375 * s], [0.74, 0.32, 0.235 * s], [0.62, 0.6, 0.265 * s], [-0.21, 0.6, 0.395 * s]]
  const left = panel(1), right = panel(-1)
  add("bodyL", "panel", quadGeo(left))
  add("bodyR", "panel", quadGeo([right[1], right[0], right[3], right[2]], false))

  // Suspension corners. Wheels are separate so they can spin.
  for (const [key, s] of [["fl", 1], ["fr", -1]] as const) {
    const z = (v: number) => v * s
    for (const dx of [-0.13, 0.13]) {
      add(key, "steel", tubeGeo([0.72 + dx, 0.55, z(0.2)], [0.72, 0.43, z(0.55)], 0.012))
      add(key, "steel", tubeGeo([0.72 + dx, 0.3, z(0.2)], [0.72, 0.18, z(0.56)], 0.012))
    }
    add(key, "steel", tubeGeo([0.72, 0.16, z(0.56)], [0.72, 0.45, z(0.56)], 0.02))
    add(key, "steel", tubeGeo([0.7, 0.22, z(0.45)], [0.55, 0.86, z(0.25)], 0.012))
    add(key, "spring", coilGeo([0.7, 0.22, z(0.45)], [0.55, 0.86, z(0.25)]))
  }
  for (const [key, s] of [["rl", 1], ["rr", -1]] as const) {
    const z = (v: number) => v * s
    add(key, "steel", tubeGeo([-0.2, 0.33, z(0.36)], [-0.72, 0.29, z(0.54)], 0.018))
    add(key, "steel", tubeGeo([-0.3, 0.45, z(0.36)], [-0.72, 0.4, z(0.54)], 0.012))
    add(key, "steel", tubeGeo([-0.72, 0.29, z(0.1)], [-0.72, 0.29, z(0.54)], 0.014))
    add(key, "steel", tubeGeo([-0.64, 0.35, z(0.5)], [-0.36, 1.0, z(0.34)], 0.012))
    add(key, "spring", coilGeo([-0.64, 0.35, z(0.5)], [-0.36, 1.0, z(0.34)]))
  }

  // Powertrain: engine block, finned head, CVT cover, gearbox, fuel tank.
  add("powertrain", "engine", placed(new THREE.BoxGeometry(0.32, 0.3, 0.28), [-0.58, 0.6, 0.02]))
  add("powertrain", "engine", placed(new THREE.CylinderGeometry(0.09, 0.11, 0.2, 18), [-0.55, 0.85, 0.02], [0, 0, 0.35]))
  for (let i = 0; i < 7; i++) add("powertrain", "steel", placed(new THREE.CylinderGeometry(0.13, 0.13, 0.008, 20), [-0.53 - i * 0.008, 0.8 + i * 0.022, 0.02], [0, 0, 0.35]))
  add("powertrain", "glass", placed(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 36), [-0.62, 0.5, -0.24], [Math.PI / 2, 0, 0]))
  add("powertrain", "steel", placed(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 28), [-0.62, 0.5, -0.24], [Math.PI / 2, 0, 0]))
  add("powertrain", "steel", placed(new THREE.BoxGeometry(0.2, 0.18, 0.22), [-0.75, 0.36, 0.0]))
  add("powertrain", "tank", placed(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 20), [-0.36, 0.97, 0.15]))

  // Ergonomics: seat, firewall, steering wheel and column, pedals.
  add("ergonomics", "seat", placed(new THREE.BoxGeometry(0.42, 0.06, 0.36), [0.02, 0.33, 0]))
  add("ergonomics", "seat", placed(new THREE.BoxGeometry(0.06, 0.5, 0.36), [-0.14, 0.58, 0], [0, 0, -0.25]))
  add("ergonomics", "glass", placed(new THREE.PlaneGeometry(0.72, 0.95), [-0.25, 0.75, 0], [0, Math.PI / 2, 0]))
  add("ergonomics", "dark", placed(new THREE.TorusGeometry(0.13, 0.016, 10, 36), [0.4, 0.82, 0], [0.35, Math.PI / 2, 0]))
  add("ergonomics", "steel", tubeGeo([0.4, 0.82, 0], [0.72, 0.55, 0], 0.012))
  for (const z of [-0.07, 0.07]) add("ergonomics", "steel", placed(new THREE.BoxGeometry(0.03, 0.12, 0.06), [0.82, 0.42, z]))

  // Electronics: dash display, data logger, harness.
  add("electronics", "glow", placed(new THREE.BoxGeometry(0.03, 0.08, 0.16), [0.5, 0.92, 0]))
  add("electronics", "board", placed(new THREE.BoxGeometry(0.14, 0.05, 0.1), [-0.15, 1.05, -0.2]))
  add("electronics", "harness", new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, 0.92, 0), new THREE.Vector3(0.3, 1.0, -0.2), new THREE.Vector3(-0.15, 1.05, -0.2), new THREE.Vector3(-0.5, 0.75, -0.1),
  ]), 40, 0.008, 6))

  const panelMap = panelTexture()
  const root = new THREE.Group()
  const groups = {} as Record<GroupKey, CarGroup>
  const wheelGeo = wheelGeometries()
  const disposables: { dispose: () => void }[] = [panelMap, wheelGeo.tire, wheelGeo.rim]

  for (const key of groupKeys) {
    const object = new THREE.Group()
    const edges = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    const group: CarGroup = { key, object, materials: [], edges }
    const mats = new Map<MatKey, THREE.MeshStandardMaterial>()
    const matFor = (m: MatKey) => {
      let mat = mats.get(m)
      if (!mat) {
        mat = baseMaterial(m, panelMap)
        mats.set(m, mat)
        group.materials.push({ mat, color: mat.color.clone(), emissive: mat.emissiveIntensity, env: 1 })
        disposables.push(mat)
      }
      return mat
    }
    for (const [m, geos] of Object.entries(buckets[key]) as [MatKey, THREE.BufferGeometry[]][]) {
      const merged = mergeGeometries(geos)
      geos.forEach((g) => g.dispose())
      const mesh = new THREE.Mesh(merged, matFor(m))
      object.add(mesh)
      disposables.push(merged)
      if (key !== "chassis" && m !== "glass") {
        const e = new THREE.EdgesGeometry(merged, 28)
        object.add(new THREE.LineSegments(e, edges))
        disposables.push(e)
      }
    }
    if (lines[key].length) {
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.Float32BufferAttribute(lines[key], 3))
      object.add(new THREE.LineSegments(g, edges))
      disposables.push(g)
    }
    if (key === "fl" || key === "fr" || key === "rl" || key === "rr") {
      const wheel = new THREE.Group()
      const tire = new THREE.Mesh(wheelGeo.tire, matFor("dark"))
      const rim = new THREE.Mesh(wheelGeo.rim, matFor("steel"))
      wheel.add(tire, rim)
      const rimEdges = new THREE.EdgesGeometry(wheelGeo.rim, 28)
      wheel.add(new THREE.LineSegments(rimEdges, edges))
      const ring = new THREE.EdgesGeometry(new THREE.TorusGeometry(0.3, 0.001, 3, 48), 1)
      wheel.add(new THREE.LineSegments(ring, edges))
      disposables.push(rimEdges, ring)
      wheel.position.set(...wheelCenters[key])
      object.add(wheel)
      group.wheel = wheel
    }
    disposables.push(edges)
    root.add(object)
    groups[key] = group
  }

  const xrayColor = new THREE.Color(0x0d0c0b)
  const tmp = new THREE.Color()
  return {
    root,
    groups,
    shade(key, lit, edgeAmount, xray) {
      const g = groups[key]
      const dim = 0.16 + 0.84 * lit
      for (const m of g.materials) {
        tmp.copy(m.color).multiplyScalar(dim).lerp(xrayColor, xray * 0.94)
        m.mat.color.copy(tmp)
        m.mat.emissiveIntensity = m.emissive * dim * (1 - xray * 0.8)
        m.mat.envMapIntensity = dim * (1 - xray * 0.9)
      }
      g.edges.opacity = Math.min(1, edgeAmount)
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
    },
  }
}

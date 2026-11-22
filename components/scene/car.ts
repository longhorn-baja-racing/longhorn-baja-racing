import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { buildSpec, groupKeys, type GroupKey, type MatKey, type Shape, type V } from "./car-spec"

/*
  Turns the checked geometry in car-spec.ts into meshes. Geometry is merged per
  group and material (and per spinning wheel), so the whole car is a few dozen
  draw calls. The spec, not this file, decides where every part goes.
*/

export { groupKeys, groupSpec, type GroupKey, type V } from "./car-spec"

function baseMaterial(key: MatKey, panelMap: THREE.Texture | null): THREE.MeshStandardMaterial {
  const m = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p)
  switch (key) {
    case "frame": return m({ color: 0xe6e2da, metalness: 0.35, roughness: 0.36 })
    case "steel": return m({ color: 0xa9afb5, metalness: 0.9, roughness: 0.28 })
    case "alu": return m({ color: 0xc9cdd2, metalness: 0.8, roughness: 0.34 })
    case "dark": return m({ color: 0x1b1b1c, roughness: 0.85 })
    case "rubber": return m({ color: 0x151515, roughness: 0.95 })
    case "spring": return m({ color: 0xff6a13, metalness: 0.45, roughness: 0.35 })
    case "shock": return m({ color: 0x2b2d30, metalness: 0.7, roughness: 0.3 })
    case "engine": return m({ color: 0x34383d, metalness: 0.6, roughness: 0.45 })
    case "seat": return m({ color: 0x151515, roughness: 0.7 })
    case "glow": return m({ color: 0x111111, emissive: 0xff8a2a, emissiveIntensity: 1.6 })
    case "panel": return m({ color: 0xffffff, map: panelMap, metalness: 0.15, roughness: 0.45 })
    case "tank": return m({ color: 0xbf5700, metalness: 0.2, roughness: 0.4 })
    case "board": return m({ color: 0x0f2c22, emissive: 0x22c55e, emissiveIntensity: 0.35 })
    case "harness": return m({ color: 0xff8a2a, emissive: 0xff6a13, emissiveIntensity: 0.45 })
    case "red": return m({ color: 0xc8261e, metalness: 0.3, roughness: 0.4 })
    case "rotor": return m({ color: 0x8d9196, metalness: 0.9, roughness: 0.22 })
    case "cvt": return m({ color: 0x26292d, metalness: 0.55, roughness: 0.4 })
    case "light": return m({ color: 0x330000, emissive: 0xff2a1a, emissiveIntensity: 1.4 })
    case "skid": return m({ color: 0x8f959b, metalness: 0.75, roughness: 0.42, side: THREE.DoubleSide })
    case "gold": return m({ color: 0xc9a227, metalness: 0.8, roughness: 0.3 })
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
  g.moveTo(0, 196); g.lineTo(512, 150); g.lineTo(512, 178); g.lineTo(0, 224)
  g.fill()
  g.fillStyle = "#fff4e6"
  g.font = "800 64px system-ui, sans-serif"
  g.textBaseline = "middle"
  g.fillText("LBR", 48, 92)
  g.font = "600 20px system-ui, sans-serif"
  g.fillText("LONGHORN BAJA RACING", 52, 136)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

const UP = new THREE.Vector3(0, 1, 0)
const v3 = (p: V) => new THREE.Vector3(p[0], p[1], p[2])

/** Keep only position, normal, and uv, non-indexed, so geometries can merge. */
function common(geo: THREE.BufferGeometry) {
  for (const name of Object.keys(geo.attributes)) if (!["position", "normal", "uv"].includes(name)) geo.deleteAttribute(name)
  if (!geo.attributes.uv) geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2))
  if (!geo.index) return geo
  const flat = geo.toNonIndexed()
  geo.dispose()
  return flat
}

function alongAxis(geo: THREE.BufferGeometry, a: V, b: V) {
  const va = v3(a), vb = v3(b)
  const dir = vb.clone().sub(va)
  const m = new THREE.Matrix4().compose(va.add(vb).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()), new THREE.Vector3(1, 1, 1))
  return geo.applyMatrix4(m)
}

const radial = (r: number) => (r < 0.016 ? 10 : r < 0.05 ? 20 : 36)

function shapeGeometry(s: Shape): THREE.BufferGeometry {
  switch (s.kind) {
    case "cyl": {
      const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2])
      return alongAxis(new THREE.CylinderGeometry(s.r, s.r, L, radial(s.r)), s.a, s.b)
    }
    case "box": {
      const geo = new THREE.BoxGeometry(...s.size)
      const m = new THREE.Matrix4().compose(v3(s.c), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(s.rot ?? [0, 0, 0]))), new THREE.Vector3(1, 1, 1))
      return geo.applyMatrix4(m)
    }
    case "sphere": return new THREE.SphereGeometry(s.r, 12, 8).translate(...s.c)
    case "torus": {
      const geo = new THREE.TorusGeometry(s.R, s.r, 10, 48)
      geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v3(s.axis).normalize()))
      return geo.translate(...s.c)
    }
    case "spring": {
      const a = v3(s.a), b = v3(s.b), L = a.distanceTo(b)
      const pts: THREE.Vector3[] = []
      const n = s.turns * 14
      for (let i = 0; i <= n; i++) {
        const t = i / n, ang = t * Math.PI * 2 * s.turns
        pts.push(new THREE.Vector3(Math.cos(ang) * s.r, t * L - L / 2, Math.sin(ang) * s.r))
      }
      return alongAxis(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, s.wire, 6), s.a, s.b)
    }
    case "panel": {
      // Fan of triangles with UVs from the panel's own axes, so the livery reads correctly on each side.
      // Wind the triangles so the face points `outward`, and push that face half the sheet thickness out.
      let pts = s.points
      const rawN = v3(pts[1]).sub(v3(pts[0])).cross(v3(pts[pts.length - 1]).sub(v3(pts[0]))).normalize()
      if (s.outward && rawN.dot(v3(s.outward)) < 0) pts = [pts[0], ...pts.slice(1).reverse()]
      if (s.outward) {
        const n = rawN.dot(v3(s.outward)) < 0 ? rawN.clone().negate() : rawN
        pts = pts.map((p) => [p[0] + n.x * s.t / 2, p[1] + n.y * s.t / 2, p[2] + n.z * s.t / 2] as V)
      }
      // Texture runs along the car (u toward the front) and up (v), whatever the point order.
      const p0 = v3(pts[0])
      const nrm = v3(pts[1]).sub(p0).cross(v3(pts[pts.length - 1]).sub(p0)).normalize()
      const uAxis = new THREE.Vector3(1, 0, 0).addScaledVector(nrm, -nrm.x).normalize()
      const vAxis = nrm.clone().cross(uAxis).normalize()
      if (vAxis.y < 0) vAxis.negate()
      const proj = pts.map((p) => { const d = v3(p).sub(p0); return [d.dot(uAxis), d.dot(vAxis)] })
      const [minU, maxU] = [Math.min(...proj.map((q) => q[0])), Math.max(...proj.map((q) => q[0]))]
      const [minV, maxV] = [Math.min(...proj.map((q) => q[1])), Math.max(...proj.map((q) => q[1]))]
      const pos: number[] = [], uv: number[] = []
      for (let i = 1; i < pts.length - 1; i++) {
        for (const k of [0, i, i + 1]) {
          pos.push(...pts[k])
          let u = (proj[k][0] - minU) / (maxU - minU || 1)
          if (s.map === "livery-flip") u = 1 - u
          uv.push(u, (proj[k][1] - minV) / (maxV - minV || 1))
        }
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
      geo.computeVertexNormals()
      return geo
    }
    case "stadium": {
      const [ax, ay] = s.a, [bx, by] = s.b
      const th = Math.atan2(by - ay, bx - ax)
      const shape = new THREE.Shape()
      shape.absarc(bx, by, s.r, th - Math.PI / 2, th + Math.PI / 2, false)
      shape.absarc(ax, ay, s.r, th + Math.PI / 2, th + (3 * Math.PI) / 2, false)
      shape.closePath()
      return new THREE.ExtrudeGeometry(shape, { depth: s.z1 - s.z0, bevelEnabled: false, curveSegments: 24 }).translate(0, 0, s.z0)
    }
    case "tire": {
      // Squared-off 23 x 7 style carcass, lathed, with staggered tread and shoulder knobs.
      const { rIn, rOut, half } = s
      const round = 0.035
      const prof: THREE.Vector2[] = []
      const arc = (cx: number, cy: number, a0: number, a1: number) => {
        for (let i = 0; i <= 6; i++) { const a = a0 + ((a1 - a0) * i) / 6; prof.push(new THREE.Vector2(cx + Math.cos(a) * round, cy + Math.sin(a) * round)) }
      }
      prof.push(new THREE.Vector2(rIn, -half + 0.01))
      arc(rOut - round, -half + round, -Math.PI / 2, 0)
      arc(rOut - round, half - round, 0, Math.PI / 2)
      prof.push(new THREE.Vector2(rIn, half - 0.01))
      const parts: THREE.BufferGeometry[] = [common(new THREE.LatheGeometry(prof, 56).rotateX(Math.PI / 2))]
      const knobs = 30
      for (let i = 0; i < knobs; i++) {
        const t = (i / knobs) * Math.PI * 2
        for (const side of [-1, 1]) {
          const stagger = i % 2 ? 0.022 : 0.052
          const place = (geo: THREE.BufferGeometry, r: number, z: number) => {
            const m = new THREE.Matrix4().compose(
              new THREE.Vector3(Math.cos(t) * r, Math.sin(t) * r, z),
              new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), t + Math.PI / 2),
              new THREE.Vector3(1, 1, 1),
            )
            parts.push(common(geo.applyMatrix4(m)))
          }
          place(new THREE.BoxGeometry(0.046, 0.012, 0.042), rOut + 0.005, stagger * side)
          if (i % 2 === 0) place(new THREE.BoxGeometry(0.04, 0.03, 0.012), rOut - 0.03, (half - 0.004) * side)
        }
      }
      const geo = mergeGeometries(parts)
      parts.forEach((g) => g.dispose())
      geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v3(s.axis).normalize()))
      return geo.translate(...s.c)
    }
    case "rim": {
      // Barrel with bead lips and a drop center, plus a six-spoke face set back from the outer lip.
      const { r, half, face } = s
      const t = 0.005
      const outer: [number, number][] = [[r + 0.006, -half], [r, -half + 0.012], [r - 0.014, -0.025], [r - 0.014, 0.025], [r, half - 0.012], [r + 0.006, half]]
      const prof = [...outer.map(([x, y]) => new THREE.Vector2(x, y)), ...outer.slice().reverse().map(([x, y]) => new THREE.Vector2(x - t, y))]
      prof.push(prof[0].clone())
      const parts: THREE.BufferGeometry[] = [common(new THREE.LatheGeometry(prof, 48).rotateX(Math.PI / 2))]
      const disc = new THREE.Shape()
      disc.absarc(0, 0, r - 0.016, 0, Math.PI * 2, false)
      for (let k = 0; k < 6; k++) {
        const a0 = (k / 6) * Math.PI * 2 + 0.2, a1 = a0 + Math.PI / 3 - 0.4
        const hole = new THREE.Path()
        hole.absarc(0, 0, r - 0.034, a0, a1, false)
        hole.absarc(0, 0, 0.055, a1, a0, true)
        hole.closePath()
        disc.holes.push(hole)
      }
      const faceZ = face * (half - 0.03)
      parts.push(common(new THREE.ExtrudeGeometry(disc, { depth: 0.008, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, faceZ - 0.004)))
      parts.push(common(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 24).rotateX(Math.PI / 2).translate(0, 0, faceZ + face * 0.012)))
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4
        parts.push(common(new THREE.CylinderGeometry(0.007, 0.007, 0.018, 8).rotateX(Math.PI / 2).translate(Math.cos(a) * 0.046, Math.sin(a) * 0.046, faceZ + face * 0.008)))
      }
      const geo = mergeGeometries(parts)
      parts.forEach((g) => g.dispose())
      geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v3(s.axis).normalize()))
      return geo.translate(...s.c)
    }
  }
}

export type CarGroup = {
  key: GroupKey
  object: THREE.Group
  materials: { mat: THREE.MeshStandardMaterial; color: THREE.Color; emissive: number }[]
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

/** Kinds that would turn into a mess of lines in the x-ray view. */
const noEdges = new Set<Shape["kind"]>(["spring", "tire", "rim", "sphere", "torus"])

export function buildCar(edgeColor: THREE.ColorRepresentation = 0xff8a2a): Car {
  const spec = buildSpec()
  const panelMap = panelTexture()
  const disposables: { dispose: () => void }[] = [panelMap]
  const root = new THREE.Group()
  const groups = {} as Record<GroupKey, CarGroup>

  for (const key of groupKeys) {
    const object = new THREE.Group()
    const edges = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    const group: CarGroup = { key, object, materials: [], edges }
    const mats = new Map<MatKey, THREE.MeshStandardMaterial>()
    const matFor = (k: MatKey) => {
      let mat = mats.get(k)
      if (!mat) {
        mat = baseMaterial(k, panelMap)
        mats.set(k, mat)
        group.materials.push({ mat, color: mat.color.clone(), emissive: mat.emissiveIntensity })
        disposables.push(mat)
      }
      return mat
    }

    // Bucket shapes by spinning pivot and material; outline-worthy shapes also feed the x-ray edges.
    type Bucket = { solid: THREE.BufferGeometry[]; outline: THREE.BufferGeometry[] }
    const buckets = new Map<string, Map<MatKey, Bucket>>()
    const pivots = new Map<string, V>()
    const sticks: number[] = []
    for (const part of spec.filter((p) => p.group === key)) {
      const pivotKey = part.spin ? part.spin.join(",") : ""
      if (part.spin) pivots.set(pivotKey, part.spin)
      if (!buckets.has(pivotKey)) buckets.set(pivotKey, new Map())
      const byMat = buckets.get(pivotKey)!
      for (const shape of part.shapes) {
        const mat = (shape.kind === "panel" && shape.mat) || part.mat
        if (!byMat.has(mat)) byMat.set(mat, { solid: [], outline: [] })
        const bucket = byMat.get(mat)!
        let geo = shapeGeometry(shape)
        if (part.spin) geo = geo.translate(-part.spin[0], -part.spin[1], -part.spin[2])
        geo = common(geo)
        bucket.solid.push(geo)
        if (part.member && shape.kind === "cyl") sticks.push(...shape.a, ...shape.b)
        else if (!part.member && !noEdges.has(shape.kind)) bucket.outline.push(geo)
      }
    }

    for (const [pivotKey, byMat] of buckets) {
      let parent: THREE.Object3D = object
      if (pivotKey) {
        const wheel = new THREE.Group()
        wheel.position.set(...pivots.get(pivotKey)!)
        object.add(wheel)
        group.wheel = wheel
        parent = wheel
      }
      for (const [mat, bucket] of byMat) {
        const merged = mergeGeometries(bucket.solid)
        const outline = bucket.outline.length ? mergeGeometries(bucket.outline) : null
        bucket.solid.forEach((g) => g.dispose())
        parent.add(new THREE.Mesh(merged, matFor(mat)))
        disposables.push(merged)
        if (outline) {
          const e = new THREE.EdgesGeometry(outline, 28)
          outline.dispose()
          parent.add(new THREE.LineSegments(e, edges))
          disposables.push(e)
        }
      }
    }
    if (sticks.length) {
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.Float32BufferAttribute(sticks, 3))
      object.add(new THREE.LineSegments(g, edges))
      disposables.push(g)
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

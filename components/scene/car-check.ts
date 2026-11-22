/*
  Physical soundness checks for the car spec, used by car-spec.test.ts.

  Each shape has a signed distance function (negative inside). Every part's
  surface is sampled about every 8 mm; a sample of one part inside another part
  is a clip. Two parts may touch or overlap only if one bolts onto the other:
  a tube, shaft, or arm whose end lies inside the other part (a joint), or a pair
  listed in `allow`. Every part must also reach the frame through such joints,
  so nothing floats.
*/
import { add, buildSpec, dot, len, norm, scale, sub, type Part, type Shape, type V } from "./car-spec.ts"

const SPACING = 0.008
/** Tread knobs stand this far proud of the tire carcass. */
const KNOB = 0.012
/** Overlap deeper than this is a clip (sampling and float noise stay below it). */
export const CLIP = 0.0015
/** Closer than this counts as touching. */
export const TOUCH = 0.003
/** Unrelated parts must keep at least this much air between them, or they read as touching. */
export const CLEAR = 0.006

/* ----------------------------------------------------------- distances */
function basis(axis: V): [V, V] {
  const a = norm(axis)
  const t: V = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const u = norm(cross(a, t))
  return [u, cross(a, u)]
}
function cross(a: V, b: V): V {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}
function rotMatrix(rot: V = [0, 0, 0]) {
  // Same as three.js Euler "XYZ": R = Rx * Ry * Rz
  const [x, y, z] = rot
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z)
  return [
    [cy * cz, -cy * sz, sy],
    [cx * sz + sx * sy * cz, cx * cz - sx * sy * sz, -sx * cy],
    [sx * sz - cx * sy * cz, sx * cz + cx * sy * sz, cx * cy],
  ]
}
const mulT = (m: number[][], p: V): V => [m[0][0] * p[0] + m[1][0] * p[1] + m[2][0] * p[2], m[0][1] * p[0] + m[1][1] * p[1] + m[2][1] * p[2], m[0][2] * p[0] + m[1][2] * p[1] + m[2][2] * p[2]]
const mul = (m: number[][], p: V): V => [m[0][0] * p[0] + m[0][1] * p[1] + m[0][2] * p[2], m[1][0] * p[0] + m[1][1] * p[1] + m[1][2] * p[2], m[2][0] * p[0] + m[2][1] * p[1] + m[2][2] * p[2]]

function sdCylinder(p: V, a: V, b: V, r: number) {
  const ba = sub(b, a), pa = sub(p, a)
  const baba = dot(ba, ba), paba = dot(pa, ba)
  const x = len(sub(scale(pa, baba), scale(ba, paba))) - r * baba
  const y = Math.abs(paba - baba * 0.5) - baba * 0.5
  const x2 = x * x, y2 = y * y * baba
  const d = Math.max(x, y) < 0 ? -Math.min(x2, y2) : (x > 0 ? x2 : 0) + (y > 0 ? y2 : 0)
  return (Math.sign(d) * Math.sqrt(Math.abs(d))) / baba
}
function sdBox(p: V, c: V, size: V, rot?: V) {
  const q = mulT(rotMatrix(rot), sub(p, c)).map((v, i) => Math.abs(v) - size[i] / 2)
  return len([Math.max(q[0], 0), Math.max(q[1], 0), Math.max(q[2], 0)]) + Math.min(Math.max(q[0], q[1], q[2]), 0)
}
function sdTorus(p: V, c: V, axis: V, R: number, r: number) {
  const q = sub(p, c), ax = norm(axis)
  const h = dot(q, ax)
  const radial = len(sub(q, scale(ax, h)))
  return Math.hypot(radial - R, h) - r
}
function distTriangle(p: V, a: V, b: V, c: V) {
  const ba = sub(b, a), pa = sub(p, a), cb = sub(c, b), pb = sub(p, b), ac = sub(a, c), pc = sub(p, c)
  const nor = cross(ba, ac)
  const sgn = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0)
  const inside = sgn(dot(cross(ba, nor), pa)) + sgn(dot(cross(cb, nor), pb)) + sgn(dot(cross(ac, nor), pc)) < 2
  if (inside) {
    const clamp = (x: number) => Math.min(1, Math.max(0, x))
    const e = (u: V, w: V) => len(sub(scale(u, clamp(dot(u, w) / dot(u, u))), w))
    return Math.min(e(ba, pa), e(cb, pb), e(ac, pc))
  }
  return Math.abs(dot(nor, pa)) / len(nor)
}
/** Wheel-shaped solid: rounded rectangle section (radii rIn..rOut, half-width half) swept around the axis. */
function sdLathe(p: V, c: V, axis: V, rIn: number, rOut: number, half: number, round: number) {
  const q = sub(p, c), ax = norm(axis)
  const h = dot(q, ax)
  const radial = len(sub(q, scale(ax, h)))
  const mid = (rIn + rOut) / 2, hw = (rOut - rIn) / 2
  const dx = Math.abs(radial - mid) - hw + round, dy = Math.abs(h) - half + round
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - round
}
function sdStadium(p: V, a: [number, number], b: [number, number], r: number, z0: number, z1: number) {
  const bax = b[0] - a[0], bay = b[1] - a[1], pax = p[0] - a[0], pay = p[1] - a[1]
  const t = Math.min(1, Math.max(0, (pax * bax + pay * bay) / (bax * bax + bay * bay)))
  const d2 = Math.hypot(pax - bax * t, pay - bay * t) - r
  const dz = Math.abs(p[2] - (z0 + z1) / 2) - (z1 - z0) / 2
  return Math.min(Math.max(d2, dz), 0) + Math.hypot(Math.max(d2, 0), Math.max(dz, 0))
}

export function sdShape(s: Shape, p: V): number {
  switch (s.kind) {
    case "cyl": return sdCylinder(p, s.a, s.b, s.r)
    case "spring": return sdCylinder(p, s.a, s.b, s.r + s.wire)
    case "box": return sdBox(p, s.c, s.size, s.rot)
    case "sphere": return len(sub(p, s.c)) - s.r
    case "torus": return sdTorus(p, s.c, s.axis, s.R, s.r)
    case "tire": return sdLathe(p, s.c, s.axis, s.rIn, s.rOut + KNOB, s.half, 0.035)
    case "rim": return sdCylinder(p, add(s.c, scale(s.axis, -s.half)), add(s.c, scale(s.axis, s.half)), s.r)
    case "stadium": return sdStadium(p, s.a, s.b, s.r, s.z0, s.z1)
    case "panel": {
      let d = Infinity
      for (let i = 1; i < s.points.length - 1; i++) d = Math.min(d, distTriangle(p, s.points[0], s.points[i], s.points[i + 1]))
      return d - s.t / 2
    }
  }
}
export const sdPart = (part: Part, p: V) => Math.min(...part.shapes.map((s) => sdShape(s, p)))

/* ------------------------------------------------------------ sampling */
function sampleCylinder(a: V, b: V, r: number, out: V[]) {
  const axis = sub(b, a), L = len(axis)
  const [u, w] = basis(axis)
  const n = Math.max(6, Math.ceil((2 * Math.PI * r) / SPACING))
  const rings = Math.max(2, Math.ceil(L / SPACING) + 1)
  for (let i = 0; i < rings; i++) {
    const c = add(a, scale(axis, i / (rings - 1)))
    for (let j = 0; j < n; j++) {
      const t = (j / n) * Math.PI * 2
      out.push(add(c, add(scale(u, Math.cos(t) * r), scale(w, Math.sin(t) * r))))
    }
  }
  const capRings = Math.max(1, Math.ceil(r / SPACING))
  for (const c of [a, b]) {
    out.push(c)
    for (let k = 1; k < capRings; k++) {
      const rr = (r * k) / capRings, m = Math.max(6, Math.ceil((2 * Math.PI * rr) / SPACING))
      for (let j = 0; j < m; j++) {
        const t = (j / m) * Math.PI * 2
        out.push(add(c, add(scale(u, Math.cos(t) * rr), scale(w, Math.sin(t) * rr))))
      }
    }
  }
}
function sampleShape(s: Shape, out: V[]) {
  switch (s.kind) {
    case "cyl": return sampleCylinder(s.a, s.b, s.r, out)
    case "spring": return sampleCylinder(s.a, s.b, s.r + s.wire, out)
    case "sphere": {
      const n = Math.max(12, Math.ceil((4 * Math.PI * s.r * s.r) / (SPACING * SPACING)))
      for (let i = 0; i < n; i++) {
        const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), t = i * 2.399963
        out.push(add(s.c, scale([Math.cos(t) * rr, y, Math.sin(t) * rr], s.r)))
      }
      return
    }
    case "box": {
      const m = rotMatrix(s.rot)
      const [sx, sy, sz] = s.size
      const steps = (L: number) => Math.max(2, Math.ceil(L / SPACING) + 1)
      const grid = (fixed: number, value: number) => {
        const axes = [0, 1, 2].filter((k) => k !== fixed)
        const n0 = steps(s.size[axes[0]]), n1 = steps(s.size[axes[1]])
        for (let i = 0; i < n0; i++) for (let j = 0; j < n1; j++) {
          const p: V = [0, 0, 0]
          p[fixed] = value
          p[axes[0]] = -s.size[axes[0]] / 2 + (s.size[axes[0]] * i) / (n0 - 1)
          p[axes[1]] = -s.size[axes[1]] / 2 + (s.size[axes[1]] * j) / (n1 - 1)
          out.push(add(s.c, mul(m, p)))
        }
      }
      grid(0, sx / 2); grid(0, -sx / 2); grid(1, sy / 2); grid(1, -sy / 2); grid(2, sz / 2); grid(2, -sz / 2)
      return
    }
    case "torus": {
      const [u, w] = basis(s.axis), ax = norm(s.axis)
      const n = Math.ceil((2 * Math.PI * s.R) / SPACING), m = Math.max(8, Math.ceil((2 * Math.PI * s.r) / SPACING))
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2
        const radial = add(scale(u, Math.cos(t)), scale(w, Math.sin(t)))
        for (let j = 0; j < m; j++) {
          const q = (j / m) * Math.PI * 2
          out.push(add(s.c, add(scale(radial, s.R + Math.cos(q) * s.r), scale(ax, Math.sin(q) * s.r))))
        }
      }
      return
    }
    case "rim": return sampleCylinder(add(s.c, scale(s.axis, -s.half)), add(s.c, scale(s.axis, s.half)), s.r, out)
    case "tire": {
      // Outline of the section (inner and outer radius, both sidewalls), swept around the axis.
      const [u, w] = basis(s.axis), ax = norm(s.axis)
      const rOut = s.rOut + KNOB
      const section: [number, number][] = []
      for (let h = -s.half; h <= s.half; h += SPACING) section.push([rOut, h], [s.rIn, h])
      for (let r = s.rIn; r <= rOut; r += SPACING) section.push([r, -s.half], [r, s.half])
      const n = Math.ceil((2 * Math.PI * rOut) / SPACING)
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2
        const radial = add(scale(u, Math.cos(t)), scale(w, Math.sin(t)))
        for (const [r, h] of section) {
          const q: V = add(s.c, add(scale(radial, r), scale(ax, h)))
          if (sdLathe(q, s.c, s.axis, s.rIn, rOut, s.half, 0.035) <= 1e-6) out.push(q)
        }
      }
      return
    }
    case "panel": {
      for (let i = 1; i < s.points.length - 1; i++) {
        const a = s.points[0], b = s.points[i], c = s.points[i + 1]
        const nrm = norm(cross(sub(b, a), sub(c, a)))
        const n = Math.max(2, Math.ceil(Math.max(len(sub(b, a)), len(sub(c, a))) / SPACING))
        for (let x = 0; x <= n; x++) for (let y = 0; y <= n - x; y++) {
          const p = add(a, add(scale(sub(b, a), x / n), scale(sub(c, a), y / n)))
          out.push(add(p, scale(nrm, s.t / 2)), add(p, scale(nrm, -s.t / 2)))
        }
      }
      return
    }
    case "stadium": {
      const minX = Math.min(s.a[0], s.b[0]) - s.r, maxX = Math.max(s.a[0], s.b[0]) + s.r
      const minY = Math.min(s.a[1], s.b[1]) - s.r, maxY = Math.max(s.a[1], s.b[1]) + s.r
      for (let x = minX; x <= maxX; x += SPACING) for (let y = minY; y <= maxY; y += SPACING) {
        for (let z = s.z0; z <= s.z1 + 1e-9; z += SPACING) {
          const p: V = [x, y, z]
          const d = sdStadium(p, s.a, s.b, s.r, s.z0, s.z1)
          if (d <= 0 && d > -SPACING) out.push(p)
        }
        for (const z of [s.z0, s.z1]) if (sdStadium([x, y, z], s.a, s.b, s.r, s.z0, s.z1) <= 1e-9) out.push([x, y, z])
      }
      return
    }
  }
}

/* --------------------------------------------------------------- checks */
const glob = (pattern: string) => new RegExp("^" + pattern.split("*").map((x) => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$")
const allows = (a: Part, b: Part) => (a.allow ?? []).some((p) => glob(p).test(b.id)) || (b.allow ?? []).some((p) => glob(p).test(a.id))

/** Ends of a part's cylinders and springs: where it bolts onto something. */
function ends(part: Part): V[] {
  return part.shapes.flatMap((s) => (s.kind === "cyl" || s.kind === "spring" ? [s.a, s.b] : []))
}
const joined = (a: Part, b: Part) => ends(a).some((p) => sdPart(b, p) <= 1e-6) || ends(b).some((p) => sdPart(a, p) <= 1e-6)

export type Report = {
  parts: number
  clips: { a: string; b: string; depth: number; at: V }[]
  /** Unrelated parts closer than TOUCH: they read as touching without being mounted. */
  tight: { a: string; b: string; gap: number }[]
  /** Deepest declared overlaps, for review. */
  mounts: { a: string; b: string; depth: number }[]
  floating: string[]
  belowGround: { id: string; y: number }[]
}

export function checkCar(parts: Part[] = buildSpec()): Report {
  const samples = parts.map((p) => {
    const out: V[] = []
    p.shapes.forEach((s) => sampleShape(s, out))
    return out
  })
  const boxes = samples.map((pts) => {
    const lo: V = [Infinity, Infinity, Infinity], hi: V = [-Infinity, -Infinity, -Infinity]
    for (const p of pts) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]) }
    return { lo, hi }
  })
  const near = (i: number, j: number) => [0, 1, 2].every((k) => boxes[i].lo[k] - CLEAR <= boxes[j].hi[k] && boxes[j].lo[k] - CLEAR <= boxes[i].hi[k])

  const clips: Report["clips"] = []
  const tight: Report["tight"] = []
  const mounts: Report["mounts"] = []
  const links: number[][] = parts.map(() => [])
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      if (!near(i, j)) continue
      let depth = Infinity, at: V = [0, 0, 0]
      for (const p of samples[i]) { const d = sdPart(parts[j], p); if (d < depth) { depth = d; at = p } }
      for (const p of samples[j]) { const d = sdPart(parts[i], p); if (d < depth) { depth = d; at = p } }
      if (depth > CLEAR) continue
      const ok = allows(parts[i], parts[j]) || joined(parts[i], parts[j])
      if (ok && depth > TOUCH) continue
      if (ok) {
        links[i].push(j); links[j].push(i)
        mounts.push({ a: parts[i].id, b: parts[j].id, depth: -depth })
      } else if (depth < -CLIP) clips.push({ a: parts[i].id, b: parts[j].id, depth: -depth, at: at.map((v) => +v.toFixed(3)) as V })
      else tight.push({ a: parts[i].id, b: parts[j].id, gap: depth })
    }
  }

  // Everything must hang off the frame through joints or declared mounts.
  const root = parts.findIndex((p) => p.id === "x-r0")
  const seen = new Set([root])
  const queue = [root]
  while (queue.length) for (const k of links[queue.pop()!]) if (!seen.has(k)) { seen.add(k); queue.push(k) }
  const floating = parts.filter((_, i) => !seen.has(i)).map((p) => p.id)

  const belowGround = parts
    .map((p, i) => ({ id: p.id, y: Math.min(...samples[i].map((s) => s[1])) }))
    .filter((x) => x.y < (x.id.includes("tire") ? -0.015 : 0.1))

  mounts.sort((x, y) => y.depth - x.depth)
  return { parts: parts.length, clips, tight, mounts, floating, belowGround }
}

/*
  Geometry of the 3D Baja car, as plain data (no three.js) so it can be checked
  in Node: `npm run test:hub` verifies no two parts clip into each other and
  every part is physically connected to the frame. car.ts turns this into meshes.

  Units are meters. x points forward, y up, z to the driver's left; the ground
  is y = 0. The layout follows a typical Baja SAE car: a 4130 tube frame with a
  rear roll hoop behind the seat, double A-arms and coilovers in front, trailing
  arms with camber links in back, a Briggs single with a CVT on its left side
  driving a gearbox and CV half shafts, rack-and-pinion steering, and 23 inch tires.

  Every mount is real: an arm or shock ends on the axis of the tube or part it
  bolts to (a "joint"), and anything else that touches must be listed in `allow`.
*/

export type V = [number, number, number]

export const groupKeys = ["chassis", "skid", "bodyL", "bodyR", "powertrain", "ergonomics", "electronics", "steer", "fl", "fr", "rl", "rr"] as const
export type GroupKey = (typeof groupKeys)[number]

export type MatKey =
  | "frame" | "steel" | "alu" | "dark" | "rubber" | "spring" | "shock" | "engine" | "seat"
  | "glow" | "panel" | "tank" | "board" | "harness" | "red" | "rotor" | "cvt" | "light" | "skid" | "gold"

export type Shape =
  /** Solid cylinder (tubes, shafts, discs) between two points. */
  | { kind: "cyl"; a: V; b: V; r: number }
  /** Box with optional rotation (radians, XYZ order). */
  | { kind: "box"; c: V; size: V; rot?: V }
  | { kind: "sphere"; c: V; r: number }
  /** Ring around `axis` through `c`: major radius R, tube radius r. */
  | { kind: "torus"; c: V; axis: V; R: number; r: number }
  /** Coil spring from a to b; checked as a cylinder of radius r + wire. */
  | { kind: "spring"; a: V; b: V; r: number; wire: number; turns: number }
  /** Thin sheet through points (a fan of triangles from the first point). `outward` picks the visible face. */
  | { kind: "panel"; points: V[]; t: number; map?: "livery" | "livery-flip"; outward?: V; mat?: MatKey }
  /** Rounded slot extruded along z (CVT cover): circles at a and b in the xy plane. */
  | { kind: "stadium"; a: [number, number]; b: [number, number]; r: number; z0: number; z1: number }
  /** Knobby tire around a wheel axis: squared-off section from rIn to rOut, half-width half. */
  | { kind: "tire"; c: V; axis: V; rIn: number; rOut: number; half: number }
  /** Wheel rim: barrel of radius r and half-width half, with a spoked face on the `face` side. */
  | { kind: "rim"; c: V; axis: V; r: number; half: number; face: 1 | -1 }

export type Part = {
  id: string
  group: GroupKey
  mat: MatKey
  shapes: Shape[]
  /** Spins with the wheel at this center (axle along z). */
  spin?: V
  /** Ids (or id prefixes ending in "*") this part is allowed to touch or overlap. */
  allow?: string[]
  /** Frame tube: drawn in the x-ray stick model. */
  member?: boolean
}

/* ------------------------------------------------------------------ math */
export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k]
export const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const len = (a: V) => Math.hypot(a[0], a[1], a[2])
export const norm = (a: V): V => scale(a, 1 / (len(a) || 1))
export const lerp3 = (a: V, b: V, t: number): V => add(a, scale(sub(b, a), t))
const mirror = (p: V): V => [p[0], p[1], -p[2]]
/** Point on segment a-b where x equals the given value. */
const atX = (a: V, b: V, x: number): V => lerp3(a, b, (x - a[0]) / (b[0] - a[0]))
/** Point on segment a-b where y equals the given value. */
const atY = (a: V, b: V, y: number): V => lerp3(a, b, (y - a[1]) / (b[1] - a[1]))
/** Point on segment a-b where z equals the given value. */
const atZ = (a: V, b: V, z: number): V => lerp3(a, b, (z - a[2]) / (b[2] - a[2]))

/* --------------------------------------------------------------- numbers */
const TUBE = 0.0135 // 1.06 in OD primary members
const TUBE2 = 0.011 // secondary members
const STEER_Y = 0.375 // steering arm and tie rod height, above the hub
export const WHEEL = { radius: 0.298, rIn: 0.145, half: 0.09, frontX: 0.75, rearX: -0.7, frontZ: 0.66, rearZ: 0.62, y: 0.3, rimR: 0.15, rimHalf: 0.07 }

/** Left-side frame nodes; the right side mirrors z. */
export const N = {
  R0: [-0.28, 0.2, 0.34] as V, // rear roll hoop, bottom
  R1: [-0.3, 0.55, 0.37] as V, // rear roll hoop, side impact height
  R2: [-0.33, 0.98, 0.37] as V, // rear roll hoop, shoulder
  R3: [-0.36, 1.28, 0.29] as V, // rear roll hoop, top corner
  E: [0.26, 1.26, 0.27] as V, // roof front
  F: [0.62, 0.86, 0.22] as V, // front bracing node
  B: [0.8, 0.62, 0.18] as V, // front bulkhead, top
  A: [0.92, 0.24, 0.16] as V, // front bulkhead, bottom
  C: [0.4, 0.2, 0.31] as V, // cockpit floor, front corner
  D: [0.4, 0.55, 0.31] as V, // side impact member, front of cockpit
  P0: [-0.92, 0.2, 0.24] as V, // engine bay, rear bottom
  P1: [-0.92, 0.62, 0.24] as V, // engine bay, rear top
}

export function buildSpec(): Part[] {
  const parts: Part[] = []
  const put = (p: Part) => { parts.push(p); return p }
  const tube = (id: string, a: V, b: V, r = TUBE, group: GroupKey = "chassis", mat: MatKey = "frame", extra: Partial<Part> = {}) =>
    put({ id, group, mat, shapes: [{ kind: "cyl", a, b, r }], member: group === "chassis" && mat === "frame", ...extra })
  /** Left and right copies: `fn` receives a mirroring function and a side suffix. */
  const both = (fn: (m: (p: V) => V, s: "L" | "R", sign: 1 | -1) => void) => {
    fn((p) => p, "L", 1)
    fn(mirror, "R", -1)
  }

  /* ---------------------------------------------------------------- frame */
  const sideMembers: [string, V, V][] = [
    ["rrh-a", N.R0, N.R1], ["rrh-b", N.R1, N.R2], ["rrh-c", N.R2, N.R3],
    ["roof", N.R3, N.E], ["fbm-up", N.E, N.F], ["fbm-low", N.F, N.B], ["bulkhead", N.B, N.A],
    ["lfs-rear", N.R0, N.C], ["lfs-front", N.C, N.A], ["sim-rear", N.R1, N.D], ["sim-front", N.D, N.B], ["pillar", N.C, N.D],
    ["bay-low", N.R0, N.P0], ["bay-up", N.R1, N.P1], ["bay-post", N.P0, N.P1], ["rear-brace", N.R2, N.P1],
  ]
  both((m, s) => {
    for (const [id, a, b] of sideMembers) tube(`${id}-${s}`, m(a), m(b))
  })
  const crosses: [string, V][] = [["x-r0", N.R0], ["x-r1", N.R1], ["x-r3", N.R3], ["x-e", N.E], ["x-f", N.F], ["x-b", N.B], ["x-a", N.A], ["x-c", N.C], ["x-p0", N.P0], ["x-p1", N.P1]]
  for (const [id, p] of crosses) tube(id, p, mirror(p))
  tube("x-diag", N.R2, mirror(N.R1), TUBE2) // rear roll hoop diagonal
  // Secondary cross members that carry the seat, pedals, rack, engine plate, and fuel tank.
  const onLfsRear = (x: number) => atX(N.R0, N.C, x)
  const onLfsFront = (x: number) => atX(N.C, N.A, x)
  const onBayLow = (x: number) => atX(N.R0, N.P0, x)
  const seatX = onLfsRear(0), pedalX = onLfsFront(0.74), rackX = onLfsFront(0.8)
  const plateFront = onBayLow(-0.4), plateRear = onBayLow(-0.84)
  const tankY = atY(N.R2, N.P1, 0.77)
  for (const [id, p] of [["x-seat", seatX], ["x-pedal", pedalX], ["x-rack", rackX], ["x-plate-f", plateFront], ["x-plate-r", plateRear], ["x-tank", tankY]] as [string, V][]) {
    tube(id, p, mirror(p), TUBE2)
  }
  // Welded nodes, so tube ends read as joints rather than gaps.
  both((m, s) => {
    for (const [k, p] of Object.entries(N)) put({ id: `node-${k}-${s}`, group: "chassis", mat: "frame", shapes: [{ kind: "sphere", c: m(p), r: TUBE * 1.12 }] })
  })

  /* ----------------------------------------------------------- skid plates */
  const skidY = N.R0[1] - TUBE - 0.002
  put({
    id: "skid-rear", group: "skid", mat: "skid", allow: ["lfs-*", "bay-low-*", "x-r0", "x-c", "x-p0", "x-seat", "x-plate-*", "node-*"],
    shapes: [{ kind: "panel", t: 0.004, points: [[N.P0[0], skidY, N.P0[2]], [N.R0[0], skidY, N.R0[2]], [N.C[0], skidY, N.C[2]], [N.C[0], skidY, -N.C[2]], [N.R0[0], skidY, -N.R0[2]], [N.P0[0], skidY, -N.P0[2]]] }],
  })
  const dropFront = (p: V): V => [p[0], p[1] - TUBE - 0.002, p[2]]
  put({
    id: "skid-front", group: "skid", mat: "skid", allow: ["lfs-*", "x-c", "x-a", "x-pedal", "x-rack", "node-*", "skid-rear"],
    shapes: [{ kind: "panel", t: 0.004, points: [dropFront(N.C), dropFront(N.A), dropFront(mirror(N.A)), dropFront(mirror(N.C))] }],
  })

  /* ----------------------------------------------------------- body panels */
  // Sheet panels riveted to the outside of the side impact and lower frame members.
  both((m, s, sign) => {
    const out = TUBE + 0.002
    const lfsAt = (x: number) => onLfsRear(x)
    const simAt = (x: number) => atX(N.R1, N.D, x)
    const bottom = (x: number): V => { const lo = lfsAt(x), hi = simAt(x); const p = lerp3(lo, hi, 0.1); return [x, p[1], lerp3(lo, hi, 0.1)[2] + out] }
    const top = (x: number): V => { const hi = simAt(x); return [x, hi[1], hi[2] + out] }
    const pts: V[] = [bottom(-0.255), bottom(0.385), top(0.385), top(-0.27)]
    // Printed livery on the outside, bare sheet on the inside.
    put({ id: `body-${s}`, group: s === "L" ? "bodyL" : "bodyR", mat: "panel", allow: [`sim-rear-${s}`, `rrh-a-${s}`, `pillar-${s}`, `node-*`], shapes: [
      { kind: "panel", t: 0.003, points: pts.map(m), map: sign > 0 ? "livery" : "livery-flip", outward: [0, 0, sign] },
      { kind: "panel", t: 0.003, points: pts.map(m), outward: [0, 0, -sign], mat: "alu" },
    ] })
  })

  /* ---------------------------------------------------- front suspension */
  both((m, s) => {
    const g: GroupKey = s === "L" ? "fl" : "fr"
    const c: V = [WHEEL.frontX, WHEEL.y, WHEEL.frontZ]
    const lbj: V = [0.75, 0.17, 0.54], ubj: V = [0.75, 0.43, 0.52]
    // Pivots sit on top of the tube (still inside it), clear of the skid plate below.
    const lift = (p: V): V => [p[0], p[1] + 0.009, p[2]]
    const lowRear = lift(onLfsFront(0.58)), lowFront = lift(onLfsFront(0.86))
    const upRear = atX(N.D, N.B, 0.56), upFront = atX(N.D, N.B, 0.74)
    const frame = [`lfs-front-${s}`, `sim-front-${s}`, `fbm-low-${s}`]
    // Lower and upper A-arms: two legs each, from frame pivots to ball joints on the upright.
    tube(`la-rear-${s}`, m(lowRear), m(lbj), TUBE2, g, "steel", { allow: frame })
    tube(`la-front-${s}`, m(lowFront), m(lbj), TUBE2, g, "steel", { allow: frame })
    tube(`ua-rear-${s}`, m(upRear), m(ubj), TUBE2, g, "steel", { allow: frame })
    tube(`ua-front-${s}`, m(upFront), m(ubj), TUBE2, g, "steel", { allow: frame })
    // Cross brace on the lower arm that carries the shock.
    const bA = atZ(lowRear, lbj, 0.43), bB = atZ(lowFront, lbj, 0.43)
    tube(`la-brace-${s}`, m(bA), m(bB), 0.009, g, "steel", { allow: [`la-*-${s}`] })
    // Upright (knuckle), spindle, hub, brake rotor and caliper, steering arm.
    tube(`upright-${s}`, m(lbj), m(ubj), 0.02, g, "alu", { allow: [`la-*-${s}`, `ua-*-${s}`] })
    const knuckleAtHub = atY(lbj, ubj, WHEEL.y)
    put({ id: `hub-${s}`, group: g, mat: "alu", spin: m(c), allow: [`upright-${s}`, `rim-${s}`], shapes: [{ kind: "cyl", a: m(knuckleAtHub), b: m([c[0], c[1], 0.69]), r: 0.04 }] })
    put({ id: `rotor-${s}`, group: g, mat: "rotor", spin: m(c), allow: [`hub-${s}`, `caliper-${s}`], shapes: [{ kind: "cyl", a: m([c[0], c[1], 0.565]), b: m([c[0], c[1], 0.571]), r: 0.09 }] })
    put({
      id: `caliper-${s}`, group: g, mat: "red", allow: [`rotor-${s}`, `upright-${s}`],
      shapes: [
        { kind: "box", c: m([c[0] - 0.062, c[1] + 0.062, 0.568]), size: [0.05, 0.034, 0.03], rot: [0, 0, Math.PI / 4] },
        { kind: "box", c: m([c[0] - 0.03, c[1] + 0.058, 0.55]), size: [0.06, 0.016, 0.012], rot: [0, 0, Math.PI / 5] },
      ],
    })
    const armRoot = atY(lbj, ubj, STEER_Y)
    const armTip: V = [0.83, STEER_Y, 0.505]
    tube(`steer-arm-${s}`, m(armRoot), m(armTip), 0.01, g, "alu", { allow: [`upright-${s}`] })
    // Coilover: lower eye on the A-arm brace, upper eye on the front bracing member.
    const shockLow = lerp3(bA, bB, 0.45), shockTop = lerp3(N.F, N.B, 0.12)
    coilover(`shock-${s}`, g, m(shockLow), m(shockTop), [`la-brace-${s}`, `fbm-low-${s}`, `la-*-${s}`])
    wheel(s, g, m(c))
  })

  /* ----------------------------------------------------- rear suspension */
  both((m, s) => {
    const g: GroupKey = s === "L" ? "rl" : "rr"
    const c: V = [WHEEL.rearX, WHEEL.y, WHEEL.rearZ]
    const kz = 0.48
    const kBot: V = [c[0], 0.14, kz], kTop: V = [c[0], 0.45, kz]
    // Knuckle (upright), hub, rotor, caliper.
    tube(`knuckle-${s}`, m(kBot), m(kTop), 0.022, g, "alu", { allow: [`tarm-${s}`, `camber-*-${s}`, `halfshaft-${s}`] })
    put({ id: `rhub-${s}`, group: g, mat: "alu", spin: m(c), allow: [`knuckle-${s}`, `rrim-${s}`, `halfshaft-${s}`], shapes: [{ kind: "cyl", a: m([c[0], c[1], kz]), b: m([c[0], c[1], 0.65]), r: 0.04 }] })
    put({ id: `rrotor-${s}`, group: g, mat: "rotor", spin: m(c), allow: [`rhub-${s}`, `rcaliper-${s}`], shapes: [{ kind: "cyl", a: m([c[0], c[1], 0.512]), b: m([c[0], c[1], 0.518]), r: 0.09 }] })
    put({
      id: `rcaliper-${s}`, group: g, mat: "red", allow: [`rrotor-${s}`, `knuckle-${s}`],
      shapes: [
        { kind: "box", c: m([c[0] + 0.062, c[1] + 0.062, 0.515]), size: [0.05, 0.034, 0.03], rot: [0, 0, -Math.PI / 4] },
        { kind: "box", c: m([c[0] + 0.03, c[1] + 0.058, 0.5]), size: [0.06, 0.016, 0.012], rot: [0, 0, -Math.PI / 5] },
      ],
    })
    // Trailing arm from a pivot on the frame ahead of the wheel, back to the knuckle.
    const pivotOnFrame = onLfsRear(-0.02)
    const pivot: V = [pivotOnFrame[0], pivotOnFrame[1] + 0.008, pivotOnFrame[2] + 0.04]
    put({ id: `tarm-bush-${s}`, group: g, mat: "dark", allow: [`lfs-rear-${s}`, `tarm-${s}`], shapes: [{ kind: "cyl", a: m([pivot[0], pivot[1], pivotOnFrame[2] + 0.01]), b: m([pivot[0], pivot[1], pivot[2] + 0.025]), r: 0.02 }] })
    const tarmEnd: V = [c[0], 0.205, kz]
    tube(`tarm-${s}`, m(pivot), m(tarmEnd), 0.02, g, "steel", { allow: [`tarm-bush-${s}`, `knuckle-${s}`] })
    // Camber links from the engine bay rails to the top and bottom of the knuckle.
    const lowIn: V = add(onBayLow(c[0]), [0, 0.01, 0]), upIn = atX(N.R1, N.P1, c[0])
    tube(`camber-low-${s}`, m(lowIn), m([c[0], 0.15, kz]), TUBE2, g, "steel", { allow: [`bay-low-${s}`, `knuckle-${s}`] })
    tube(`camber-up-${s}`, m(upIn), m([c[0], 0.43, kz]), TUBE2, g, "steel", { allow: [`bay-up-${s}`, `knuckle-${s}`] })
    // Coilover from the trailing arm up to the rear bracing member.
    const shockLow = atX(pivot, tarmEnd, -0.52)
    const shockTop = atX(N.R2, N.P1, -0.42)
    coilover(`rshock-${s}`, g, m(shockLow), m(shockTop), [`tarm-${s}`, `rear-brace-${s}`])
    wheel(s, g, m(c), "r")
  })

  /* ------------------------------------------------------------ steering */
  const rackY = rackX[1] + TUBE2 + 0.035
  const rackA: V = [rackX[0], rackY, 0.16]
  put({ id: "rack", group: "steer", mat: "alu", allow: ["tierod-*", "column-low", "rack-mount-*"], shapes: [{ kind: "cyl", a: mirror(rackA), b: rackA, r: 0.022 }] })
  both((m, s) => {
    put({ id: `rack-mount-${s}`, group: "steer", mat: "alu", allow: ["rack", "x-rack"], shapes: [{ kind: "box", c: m([rackX[0], (rackX[1] + rackY) / 2, 0.09]), size: [0.04, rackY - rackX[1], 0.03] }] })
    tube(`tierod-${s}`, m(rackA), m([0.83, STEER_Y, 0.505]), 0.009, "steer", "steel", { allow: ["rack", `steer-arm-${s}`] })
  })

  /* --------------------------------------------------------- ergonomics */
  const seatTop = seatX[1] + TUBE2
  put({ id: "seat-pan", group: "ergonomics", mat: "seat", allow: ["x-seat", "seat-back"], shapes: [{ kind: "box", c: [0.02, seatTop + 0.026, 0], size: [0.4, 0.052, 0.4] }] })
  const backBottom: V = [-0.155, seatTop + 0.03, 0], backTop: V = [-0.2, 0.8, 0]
  const backMid = lerp3(backBottom, backTop, 0.5)
  const backTilt = Math.atan2(backTop[0] - backBottom[0], backTop[1] - backBottom[1])
  put({ id: "seat-back", group: "ergonomics", mat: "seat", allow: ["seat-pan"], shapes: [{ kind: "box", c: backMid, size: [0.05, len(sub(backTop, backBottom)), 0.4], rot: [0, 0, -backTilt] }] })
  put({ id: "seat-belt", group: "ergonomics", mat: "red", allow: ["seat-back", "seat-pan"], shapes: [
    { kind: "box", c: [backTop[0] + 0.03, 0.62, 0.09], size: [0.006, 0.36, 0.045], rot: [0, 0, -backTilt] },
    { kind: "box", c: [backTop[0] + 0.03, 0.62, -0.09], size: [0.006, 0.36, 0.045], rot: [0, 0, -backTilt] },
  ] })
  // Firewall: aluminum sheet against the front of the rear roll hoop's bottom cross.
  const fwX = N.R0[0] + TUBE + 0.0015
  put({ id: "firewall", group: "ergonomics", mat: "alu", allow: ["x-r0", "logger", "node-R0-*"], shapes: [{ kind: "box", c: [fwX, 0.575, 0], size: [0.003, 0.71, 0.64] }] })
  // Steering column (with a U-joint) from the rack's pinion to the wheel.
  const pinion: V = [rackX[0] - 0.005, rackY + 0.012, 0]
  const uj: V = [0.62, 0.5, 0]
  const wheelHub: V = [0.33, 0.76, 0]
  tube("column-low", pinion, uj, 0.012, "ergonomics", "steel", { allow: ["rack", "ujoint", "column-up"] })
  tube("column-up", uj, wheelHub, 0.012, "ergonomics", "steel", { allow: ["ujoint", "column-low", "steering-wheel"] })
  put({ id: "ujoint", group: "ergonomics", mat: "steel", allow: ["column-*"], shapes: [{ kind: "sphere", c: uj, r: 0.02 }] })
  const colDir = norm(sub(wheelHub, uj))
  const wheelC = add(wheelHub, scale(colDir, 0.01))
  put({
    id: "steering-wheel", group: "ergonomics", mat: "dark", allow: ["column-up"],
    shapes: [
      { kind: "torus", c: wheelC, axis: colDir, R: 0.13, r: 0.014 },
      { kind: "cyl", a: sub(wheelC, scale(colDir, 0.02)), b: add(wheelC, scale(colDir, 0.015)), r: 0.03 },
      { kind: "cyl", a: wheelC, b: add(wheelC, [0, 0, 0.12]), r: 0.008 },
      { kind: "cyl", a: wheelC, b: add(wheelC, [0, 0, -0.12]), r: 0.008 },
      { kind: "cyl", a: wheelC, b: add(wheelC, scale(norm([-colDir[1], colDir[0], 0]), -0.12)), r: 0.008 },
    ],
  })
  // Pedals pivot on a floor cross; the brake pedal pushes two master cylinders mounted on the bulkhead.
  const mcPlateX = atY(N.B, N.A, 0.37)[0] - 0.004
  put({ id: "mc-plate", group: "ergonomics", mat: "alu", allow: ["bulkhead-*", "mc-*"], shapes: [{ kind: "box", c: [mcPlateX, 0.37, 0], size: [0.006, 0.08, 0.34] }] })
  for (const [id, z] of [["brake", 0.07], ["gas", -0.07]] as const) {
    const base: V = [pedalX[0], pedalX[1], z], top: V = [0.7, 0.43, z]
    tube(`pedal-${id}`, base, top, 0.01, "ergonomics", "steel", { allow: ["x-pedal", `pedal-pad-${id}`, "mc-rod-*"] })
    put({ id: `pedal-pad-${id}`, group: "ergonomics", mat: "dark", allow: [`pedal-${id}`], shapes: [{ kind: "box", c: top, size: [0.014, 0.08, 0.06], rot: [0, 0, 0.2] }] })
  }
  for (const dz of [0.035, -0.035]) {
    // Pushrods from the brake pedal arm to the two master cylinders.
    const from = atY([pedalX[0], pedalX[1], 0.07], [0.7, 0.43, 0.07], 0.35)
    const mcStart = mcPlateX - 0.075
    put({ id: `mc-brake-${dz > 0 ? "a" : "b"}`, group: "ergonomics", mat: "alu", allow: ["mc-plate", `mc-rod-${dz > 0 ? "a" : "b"}`], shapes: [{ kind: "cyl", a: [mcStart, 0.35, 0.07 + dz], b: [mcPlateX - 0.002, 0.35, 0.07 + dz], r: 0.014 }] })
    tube(`mc-rod-${dz > 0 ? "a" : "b"}`, [from[0], 0.35, 0.07], [mcStart + 0.01, 0.35, 0.07 + dz], 0.005, "ergonomics", "steel", { allow: ["pedal-brake", `mc-brake-${dz > 0 ? "a" : "b"}`] })
  }

  /* ----------------------------------------------------------- powertrain */
  const plateTop = plateFront[1] + TUBE2 + 0.009
  put({ id: "engine-plate", group: "chassis", mat: "alu", allow: ["x-plate-*", "engine", "gearbox"], shapes: [{ kind: "box", c: [-0.62, plateTop - 0.0045, 0], size: [0.52, 0.009, 0.4] }] })
  const eng = { x: -0.52, w: 0.3, h: 0.28, z0: -0.1, z1: 0.14 }
  const engC: V = [eng.x, plateTop + eng.h / 2, (eng.z0 + eng.z1) / 2]
  put({ id: "engine", group: "powertrain", mat: "engine", allow: ["engine-plate", "cylinder", "recoil", "carb", "crank", "cyl-fin-*"], shapes: [{ kind: "box", c: engC, size: [eng.w, eng.h, eng.z1 - eng.z0] }] })
  const tilt = (25 * Math.PI) / 180
  const cylBase: V = [-0.54, plateTop + eng.h - 0.012, 0.03]
  const cylDir: V = [-Math.sin(tilt), Math.cos(tilt), 0]
  const cylTop = add(cylBase, scale(cylDir, 0.17))
  put({ id: "cylinder", group: "powertrain", mat: "engine", allow: ["engine", "cyl-fin-*", "head", "exhaust"], shapes: [{ kind: "cyl", a: cylBase, b: cylTop, r: 0.068 }] })
  for (let i = 0; i < 7; i++) {
    const p = add(cylBase, scale(cylDir, 0.05 + i * 0.017))
    put({ id: `cyl-fin-${i}`, group: "powertrain", mat: "alu", allow: ["cylinder", "engine", "cyl-fin-*"], shapes: [{ kind: "cyl", a: add(p, scale(cylDir, -0.003)), b: add(p, scale(cylDir, 0.003)), r: 0.102 }] })
  }
  const headC = add(cylTop, scale(cylDir, 0.012))
  put({ id: "head", group: "powertrain", mat: "alu", allow: ["cylinder", "exhaust", "cyl-fin-*"], shapes: [{ kind: "box", c: headC, size: [0.13, 0.045, 0.13], rot: [0, 0, tilt] }] })
  put({ id: "recoil", group: "powertrain", mat: "dark", allow: ["engine"], shapes: [{ kind: "cyl", a: [-0.5, engC[1], eng.z0 + 0.01], b: [-0.5, engC[1], eng.z0 - 0.05], r: 0.1 }] })
  put({ id: "carb", group: "powertrain", mat: "alu", allow: ["engine", "air-filter"], shapes: [{ kind: "box", c: [-0.62, 0.46, eng.z0 - 0.025], size: [0.05, 0.05, 0.05] }] })
  put({ id: "air-filter", group: "powertrain", mat: "dark", allow: ["carb"], shapes: [{ kind: "cyl", a: [-0.62, 0.46, eng.z0 - 0.045], b: [-0.62, 0.46, eng.z0 - 0.14], r: 0.05 }] })
  const mufflerA: V = [-0.69, 0.62, -0.16], mufflerB: V = [-0.87, 0.62, -0.16]
  tube("exhaust", add(headC, [-0.005, 0.004, -0.045]), add(mufflerA, [-0.012, 0, 0]), 0.016, "powertrain", "steel", { allow: ["head", "muffler", "cylinder"] })
  put({ id: "muffler", group: "powertrain", mat: "steel", allow: ["exhaust"], shapes: [{ kind: "cyl", a: mufflerA, b: mufflerB, r: 0.055 }] })
  // Fuel tank, strapped on the cross member between the rear braces.
  const tankR = 0.085
  put({ id: "tank", group: "powertrain", mat: "tank", allow: ["x-tank", "tank-cap"], shapes: [{ kind: "cyl", a: [tankY[0], tankY[1] + TUBE2 - 0.003, 0], b: [tankY[0], 0.93, 0], r: tankR }] })
  put({ id: "tank-cap", group: "powertrain", mat: "dark", allow: ["tank"], shapes: [{ kind: "cyl", a: [tankY[0], 0.925, 0.03], b: [tankY[0], 0.95, 0.03], r: 0.022 }] })
  // CVT on the engine's left, driving the gearbox input; gearbox drives CV half shafts.
  const gb = { x0: -0.88, x1: -0.7, z: 0.13, h: 0.24 }
  const gbC: V = [(gb.x0 + gb.x1) / 2, plateTop + gb.h / 2, 0]
  put({ id: "gearbox", group: "powertrain", mat: "engine", allow: ["engine-plate", "gb-input", "halfshaft-*", "cv-in-*"], shapes: [{ kind: "box", c: gbC, size: [gb.x1 - gb.x0, gb.h, gb.z * 2] }] })
  const primary: [number, number] = [-0.52, 0.38], secondary: [number, number] = [-0.78, 0.44]
  const cvtZ0 = 0.16, cvtZ1 = 0.235
  put({ id: "cvt", group: "powertrain", mat: "cvt", allow: ["crank", "gb-input"], shapes: [{ kind: "stadium", a: primary, b: secondary, r: 0.105, z0: cvtZ0, z1: cvtZ1 }] })
  tube("crank", [primary[0], primary[1], eng.z1 - 0.01], [primary[0], primary[1], cvtZ0 + 0.01], 0.02, "powertrain", "steel", { allow: ["engine", "cvt"] })
  tube("gb-input", [secondary[0], secondary[1], gb.z - 0.01], [secondary[0], secondary[1], cvtZ0 + 0.01], 0.02, "powertrain", "steel", { allow: ["gearbox", "cvt"] })
  both((m, s) => {
    const out: V = [-0.79, WHEEL.y - 0.012, gb.z - 0.01]
    const hub: V = [WHEEL.rearX, WHEEL.y, 0.49]
    tube(`halfshaft-${s}`, m(out), m(hub), 0.014, "powertrain", "steel", { allow: ["gearbox", `knuckle-${s}`, `rhub-${s}`, `cv-*-${s}`] })
    const dir = norm(sub(hub, out))
    put({ id: `cv-in-${s}`, group: "powertrain", mat: "dark", allow: ["gearbox", `halfshaft-${s}`], shapes: [{ kind: "cyl", a: m(add(out, scale(dir, 0.008))), b: m(add(out, scale(dir, 0.07))), r: 0.03 }] })
    const pOuter = atZ(out, hub, 0.44)
    put({ id: `cv-out-${s}`, group: "powertrain", mat: "dark", allow: [`halfshaft-${s}`], shapes: [{ kind: "cyl", a: m(add(pOuter, scale(dir, -0.065))), b: m(pOuter), r: 0.03 }] })
  })

  /* ---------------------------------------------------------- electronics */
  const dashY = N.F[1] + TUBE + 0.035
  put({ id: "dash", group: "electronics", mat: "dark", allow: ["x-f", "dash-screen", "kill-switch"], shapes: [{ kind: "box", c: [N.F[0], dashY, 0], size: [0.04, 0.07, 0.16] }] })
  put({ id: "dash-screen", group: "electronics", mat: "glow", allow: ["dash"], shapes: [{ kind: "box", c: [N.F[0] - 0.021, dashY, 0], size: [0.004, 0.05, 0.12] }] })
  put({ id: "kill-switch", group: "electronics", mat: "red", allow: ["dash"], shapes: [{ kind: "cyl", a: [N.F[0], dashY + 0.03, 0.055], b: [N.F[0], dashY + 0.052, 0.055], r: 0.012 }] })
  put({ id: "logger", group: "electronics", mat: "board", allow: ["firewall", "harness"], shapes: [{ kind: "box", c: [fwX - 0.0015 - 0.015, 0.87, 0.21], size: [0.03, 0.1, 0.14] }] })
  put({ id: "brake-light", group: "electronics", mat: "light", allow: ["x-r3"], shapes: [{ kind: "box", c: [N.R3[0], N.R3[1] + TUBE + 0.02, 0], size: [0.03, 0.04, 0.1] }] })
  // Wiring harness run along the inside of the frame from the dash to the logger.
  const harnessPts: V[] = [[N.F[0] - 0.01, dashY + 0.01, 0.07], [0.55, 0.9, 0.16], [0.42, 1.08, 0.2], [0.18, 1.22, 0.235], [-0.12, 1.23, 0.25], [-0.29, 1.15, 0.28], [-0.27, 1.0, 0.26], [fwX - 0.02, 0.915, 0.24]]
  put({ id: "harness", group: "electronics", mat: "harness", allow: ["dash", "logger"], shapes: harnessPts.slice(1).map((p, i) => ({ kind: "cyl" as const, a: harnessPts[i], b: p, r: 0.006 })) })

  return parts

  /* --------------------------------------------------------------- helpers */
  function coilover(id: string, group: GroupKey, low: V, top: V, allow: string[]) {
    const dir = norm(sub(top, low))
    const L = len(sub(top, low))
    const at = (t: number) => add(low, scale(dir, L * t))
    put({
      id, group, mat: "shock", allow,
      shapes: [
        { kind: "cyl", a: low, b: at(0.08), r: 0.012 }, // lower eye
        { kind: "cyl", a: at(0.06), b: at(0.55), r: 0.014 }, // shaft
        { kind: "cyl", a: at(0.5), b: at(0.94), r: 0.024 }, // body
        { kind: "cyl", a: at(0.92), b: top, r: 0.012 }, // upper eye
      ],
    })
    put({ id: `${id}-spring`, group, mat: "spring", allow: [id], shapes: [{ kind: "spring", a: at(0.16), b: at(0.8), r: 0.032, wire: 0.0065, turns: 9 }] })
  }

  function wheel(s: "L" | "R", group: GroupKey, c: V, prefix = "") {
    const outward: 1 | -1 = c[2] > 0 ? 1 : -1
    put({ id: `${prefix}tire-${s}`, group, mat: "rubber", spin: c, allow: [`${prefix}rim-${s}`], shapes: [{ kind: "tire", c, axis: [0, 0, 1], rIn: WHEEL.rIn, rOut: WHEEL.radius, half: WHEEL.half }] })
    put({
      id: `${prefix}rim-${s}`, group, mat: "alu", spin: c, allow: [`${prefix}tire-${s}`, `${prefix === "r" ? "rhub" : "hub"}-${s}`],
      shapes: [{ kind: "rim", c, axis: [0, 0, 1], r: WHEEL.rimR, half: WHEEL.rimHalf, face: outward }],
    })
  }
}

/** Where each group travels in the exploded view, and the point a callout points at. */
export const groupSpec: Record<GroupKey, { explode: V; anchor: V }> = {
  chassis: { explode: [0, 0.15, 0], anchor: [N.R3[0], N.R3[1], N.R3[2]] },
  skid: { explode: [0, -0.5, 0], anchor: [0.3, 0.18, 0.2] },
  bodyL: { explode: [0, 0.05, 0.85], anchor: [0.1, 0.4, 0.36] },
  bodyR: { explode: [0, 0.05, -0.85], anchor: [0.1, 0.4, -0.36] },
  powertrain: { explode: [-1.1, 0.4, 0], anchor: [-0.65, 0.41, 0.235] },
  ergonomics: { explode: [0.1, 1.05, 0], anchor: [0.33, 0.76, 0.13] },
  electronics: { explode: [0.3, 0.85, 0], anchor: [N.F[0], N.F[1] + 0.08, 0.08] },
  steer: { explode: [0.75, -0.05, 0], anchor: [0.85, 0.29, 0.16] },
  fl: { explode: [0.55, 0, 0.9], anchor: [WHEEL.frontX, WHEEL.y, WHEEL.frontZ + 0.09] },
  fr: { explode: [0.55, 0, -0.9], anchor: [WHEEL.frontX, WHEEL.y, -WHEEL.frontZ - 0.09] },
  rl: { explode: [-0.55, 0, 0.9], anchor: [WHEEL.rearX, WHEEL.y, WHEEL.rearZ + 0.09] },
  rr: { explode: [-0.55, 0, -0.9], anchor: [WHEEL.rearX, WHEEL.y, -WHEEL.rearZ - 0.09] },
}

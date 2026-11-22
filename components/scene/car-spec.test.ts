// Run with: npm run test:hub
import { test } from "node:test"
import assert from "node:assert/strict"
import { CLEAR, checkCar } from "./car-check.ts"
import { buildSpec, groupKeys, type Part } from "./car-spec.ts"

const report = checkCar()

test("no part of the car clips into another", () => {
  assert.deepEqual(report.clips, [])
})

test("unrelated parts keep visible clearance", () => {
  assert.deepEqual(report.tight, [], "parts closer than " + CLEAR * 1000 + " mm without being mounted to each other")
})

test("every part is mounted to the frame, nothing floats", () => {
  assert.deepEqual(report.floating, [])
})

test("the car sits on its tires", () => {
  assert.deepEqual(report.belowGround, [])
})

test("ids are unique and every group is used", () => {
  const parts = buildSpec()
  assert.equal(new Set(parts.map((p) => p.id)).size, parts.length)
  for (const g of groupKeys) assert.ok(parts.some((p) => p.group === g), g)
})

test("the car is symmetric left to right", () => {
  const parts = buildSpec()
  const byId = new Map(parts.map((p) => [p.id, p]))
  for (const p of parts.filter((x) => x.id.endsWith("-L"))) {
    const twin = byId.get(p.id.slice(0, -2) + "-R")
    assert.ok(twin, p.id + " has a right-side twin")
    // Same shapes with mirrored coordinates (signs differ only on z and rotations).
    const flat = (q: Part) => JSON.stringify(q.shapes, (k, v) => (k === "map" ? undefined : typeof v === "number" ? Math.abs(+v.toFixed(5)) : v))
    assert.equal(flat(p), flat(twin!), p.id)
  }
})

// The checker itself must catch mistakes, or the tests above prove nothing.
test("the checker catches a clipping part and a floating part", () => {
  const parts = buildSpec()
  parts.push({ id: "bad-rod", group: "powertrain", mat: "steel", shapes: [{ kind: "cyl", a: [-0.6, 0.35, -0.3], b: [-0.6, 0.35, 0.3], r: 0.01 }] })
  parts.push({ id: "bad-box", group: "electronics", mat: "dark", shapes: [{ kind: "box", c: [0, 1.8, 0], size: [0.1, 0.1, 0.1] }] })
  const r = checkCar(parts)
  assert.ok(r.clips.some((c) => [c.a, c.b].includes("bad-rod") && [c.a, c.b].includes("engine")), "rod through the engine is a clip")
  assert.ok(r.floating.includes("bad-box"), "box in mid-air floats")
})

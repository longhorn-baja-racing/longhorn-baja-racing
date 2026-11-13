// Run with: npm run test:hub
import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { subteamIds } from "../subteams.ts"
import {
  allRoles,
  buildRolePayload,
  codeForRole,
  parseHubCodes,
  parseHubPayload,
  parseHubSource,
  parseResource,
  roleKey,
  sortResources,
  type HubCodes,
  type HubSource,
} from "./schema.ts"
import {
  createBundle,
  HubBundleOutdatedError,
  MIN_ITERATIONS,
  parseHubBundle,
  reopenBundle,
  toBase64,
  fromBase64,
  unlockBundle,
} from "./crypto.ts"

const link = (id: string, category = "Drive") => ({ id, label: `Label ${id}`, category, url: `https://example.com/${id}` })

const source: HubSource = parseHubSource({
  general: [link("team-drive"), link("team-bom", "BOM")],
  leads: [link("applicant-responses", "Recruiting")],
  subteams: { powertrain: [link("pt-drive")], dynamics: [link("dyn-notes", "Notes")] },
})

const codes: HubCodes = {
  general: "general-test-code-0001",
  leads: "leads-test-code-0002xx",
  subteams: Object.fromEntries(subteamIds.map((id, index) => [id, `${id}-test-code-${String(index).padStart(4, "0")}`])) as HubCodes["subteams"],
}

test("payloads contain only their role's scope", () => {
  const general = buildRolePayload(source, { kind: "general" })
  assert.deepEqual(general.subteams, {})
  assert.equal(general.leads, undefined)

  const powertrain = buildRolePayload(source, { kind: "subteam", subteam: "powertrain" })
  assert.deepEqual(Object.keys(powertrain.subteams), ["powertrain"])
  assert.equal(powertrain.leads, undefined)
  assert.equal(powertrain.general.length, 2)

  const chassis = buildRolePayload(source, { kind: "subteam", subteam: "chassis" })
  assert.deepEqual(chassis.subteams, {})

  const leads = buildRolePayload(source, { kind: "leads" })
  assert.deepEqual(Object.keys(leads.subteams), ["powertrain", "dynamics"])
  assert.equal(leads.leads?.length, 1)

  for (const role of allRoles()) parseHubPayload(buildRolePayload(source, role))
})

test("payload parsing rejects out-of-scope data", () => {
  const powertrain = buildRolePayload(source, { kind: "subteam", subteam: "powertrain" })
  assert.throws(() => parseHubPayload({ ...powertrain, subteams: { ...powertrain.subteams, dynamics: [link("x")] } }), /may only contain/)
  assert.throws(() => parseHubPayload({ ...powertrain, leads: [] }), /only allowed in the leads payload/)
  const general = buildRolePayload(source, { kind: "general" })
  assert.throws(() => parseHubPayload({ ...general, subteams: { chassis: [] } }), /must be empty/)
  assert.throws(() => parseHubPayload({ ...general, version: 2 }), /version/)
})

test("resources are validated", () => {
  assert.throws(() => parseResource({ ...link("a"), url: "javascript:alert(1)" }, "r"), /https: or mailto:/)
  assert.throws(() => parseResource({ ...link("a"), url: "http://example.com" }, "r"), /https: or mailto:/)
  assert.throws(() => parseResource({ ...link("Bad Id") }, "r"), /lowercase/)
  assert.throws(() => parseResource({ ...link("a"), category: "Secret" }, "r"), /must be one of/)
  assert.throws(() => parseResource({ ...link("a"), extra: true }, "r"), /unknown field/)
  assert.throws(() => parseHubSource({ general: [link("a"), link("a")] }), /duplicate/)
  assert.throws(() => parseHubSource({ general: [], subteams: { aero: [] } }), /unknown subteam/)
  assert.equal(parseResource({ ...link("m"), url: "mailto:team@example.com" }, "r").url, "mailto:team@example.com")
})

test("sortResources orders by order then label", () => {
  const sorted = sortResources([
    { ...link("c"), label: "C" },
    { ...link("b"), label: "B", order: 2 },
    { ...link("a"), label: "A" },
    { ...link("d"), label: "D", order: 1 },
  ] as never)
  assert.deepEqual(sorted.map((r) => r.label), ["D", "B", "A", "C"])
})

test("codes must be long, mixed, and unique", () => {
  const custom = { allowCustom: true }
  assert.doesNotThrow(() => parseHubCodes(codes, custom))
  assert.throws(() => parseHubCodes({ ...codes, general: "short-1" }, custom), /at least 16/)
  assert.throws(() => parseHubCodes({ ...codes, general: "onlylettersherexx" }, custom), /letters only/)
  assert.throws(() => parseHubCodes({ ...codes, leads: codes.general }, custom), /same code/)
  assert.throws(() => parseHubCodes({ ...codes, subteams: { ...codes.subteams, powertrain: undefined } }, custom), /powertrain/)
})

test("only generated codes are accepted unless custom codes are allowed", () => {
  // Hand-picked codes like this pass the length and mix rules but are guessable.
  assert.throws(() => parseHubCodes(codes), /not a generated code/)
  const generated = (seed: number) => {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
    const symbols = Array.from({ length: 20 }, (_, i) => alphabet[(seed * 7 + i * 13) % alphabet.length])
    return symbols.join("").replace(/(.{5})(?=.)/g, "$1-")
  }
  const valid: HubCodes = {
    general: generated(1),
    leads: generated(2),
    subteams: Object.fromEntries(subteamIds.map((id, index) => [id, generated(index + 3)])) as HubCodes["subteams"],
  }
  assert.doesNotThrow(() => parseHubCodes(valid))
  assert.throws(() => parseHubCodes({ ...valid, general: "baja-racing-2026-team" }), /not a generated code/)
})

test("each code unlocks exactly its own role", async () => {
  const bundle = await createBundle(
    allRoles().map((role) => ({ code: codeForRole(codes, role), payload: buildRolePayload(source, role) })),
    MIN_ITERATIONS,
  )
  const json = JSON.stringify(bundle)
  assert.ok(!json.includes("example.com") && !json.includes("Label"), "bundle must not leak plaintext")
  const parsed = parseHubBundle(JSON.parse(json))
  assert.equal(parsed.payloads.length, allRoles().length)

  for (const role of [{ kind: "general" }, { kind: "subteam", subteam: "dynamics" }, { kind: "leads" }] as const) {
    const result = await unlockBundle(parsed, codeForRole(codes, role))
    assert.ok(result)
    assert.equal(roleKey(result.payload.role), roleKey(role))
    assert.equal(result.key.extractable, false)
  }

  // Surrounding whitespace is ignored, everything else is exact.
  assert.ok(await unlockBundle(parsed, `  ${codes.general}\n`))
  assert.equal(await unlockBundle(parsed, codes.general.toUpperCase()), null)
  assert.equal(await unlockBundle(parsed, "wrong-code-123456789"), null)
  assert.equal(await unlockBundle(parsed, ""), null)
})

test("tampering is detected and saved keys survive only same-salt rebuilds", async () => {
  const entries = allRoles().map((role) => ({ code: codeForRole(codes, role), payload: buildRolePayload(source, role) }))
  const bundle = await createBundle(entries, MIN_ITERATIONS)
  const unlocked = await unlockBundle(bundle, codes.leads)
  assert.ok(unlocked)

  const tampered = structuredClone(bundle)
  for (const payload of tampered.payloads) {
    const bytes = fromBase64(payload.data)
    bytes[0] ^= 1
    payload.data = toBase64(bytes)
  }
  assert.equal(await unlockBundle(tampered, codes.leads), null)

  // Rebuild keeping the leads salt: the saved key still opens the new content.
  const updated = parseHubSource({ ...source, leads: [...source.leads, link("interview-notes", "Recruiting")] })
  const sameSalt = await createBundle(
    allRoles().map((role) => ({
      code: codeForRole(codes, role),
      payload: buildRolePayload(updated, role),
      salt: role.kind === "leads" ? unlocked.salt : undefined,
    })),
    MIN_ITERATIONS,
  )
  assert.equal((await reopenBundle(sameSalt, unlocked.key, unlocked.salt))?.leads?.length, 2)

  // A fresh salt (code rotation) invalidates the saved key.
  const fresh = await createBundle(entries, MIN_ITERATIONS)
  assert.equal(await reopenBundle(fresh, unlocked.key, unlocked.salt), null)
})

test("bundle parsing rejects weak or malformed bundles", async () => {
  const bundle = await createBundle([{ code: codes.general, payload: buildRolePayload(source, { kind: "general" }) }], MIN_ITERATIONS)
  assert.throws(() => parseHubBundle({ ...bundle, kdf: { ...bundle.kdf, iterations: 1000 } }), /iterations/)
  assert.throws(() => parseHubBundle({ ...bundle, version: 9 }), /version/)
  assert.throws(() => parseHubBundle({ ...bundle, payloads: [] }), /payload list/)
  assert.throws(() => parseHubBundle({ ...bundle, payloads: [{ ...bundle.payloads[0], iv: "AAAA" }] }), /malformed/)
})

test("payload sizes do not reveal the role", async () => {
  const bundle = await createBundle(
    allRoles().map((role) => ({ code: codeForRole(codes, role), payload: buildRolePayload(source, role) })),
    MIN_ITERATIONS,
  )
  const lengths = new Set(bundle.payloads.map((payload) => fromBase64(payload.data).length))
  assert.equal(lengths.size, 1)
  // Padding is whitespace, so the padded payload still parses.
  assert.equal((await unlockBundle(bundle, codes.leads))?.payload.leads?.length, 1)
})

test("a renamed subteam does not lock out correct codes", async () => {
  // Simulates a bundle built before a subteam id was renamed to something
  // lib/subteams.ts no longer knows ("aero").
  const leads = buildRolePayload(source, { kind: "leads" })
  const staleLeads = { ...leads, subteams: { ...leads.subteams, aero: [link("aero-drive")] } }
  const staleSubteam = { version: 1, role: { kind: "subteam", subteam: "aero" }, general: source.general, subteams: { aero: [link("aero-drive")] } }
  const bundle = await createBundle(
    [
      { code: codes.general, payload: buildRolePayload(source, { kind: "general" }) },
      { code: codes.leads, payload: staleLeads as never },
      { code: codes.subteams.powertrain, payload: staleSubteam as never },
    ],
    MIN_ITERATIONS,
  )

  // Leads still open the hub; the unknown subteam is skipped.
  const unlocked = await unlockBundle(bundle, codes.leads)
  assert.ok(unlocked)
  assert.deepEqual(Object.keys(unlocked.payload.subteams).sort(), ["dynamics", "powertrain"])

  // The removed subteam's correct code reports an outdated bundle, not a wrong code.
  await assert.rejects(unlockBundle(bundle, codes.subteams.powertrain), HubBundleOutdatedError)
  assert.equal(await unlockBundle(bundle, "wrong-code-123456789"), null)

  // An out-of-scope known subteam is still rejected.
  const general = buildRolePayload(source, { kind: "general" })
  assert.throws(() => parseHubPayload({ ...general, subteams: { aero: [] } }), /must be empty/)
})

test("committed bundle, if present, is well formed", () => {
  const path = "public/hub/bundle.json"
  if (!existsSync(path)) return
  const bundle = parseHubBundle(JSON.parse(readFileSync(path, "utf8")))
  assert.equal(bundle.payloads.length, allRoles().length)
})

// Hub bundle tool. Run with Node 22+ (TypeScript runs directly):
//
//   node scripts/hub-build.ts codes [--rotate all|general,leads,powertrain,...]
//   node scripts/hub-build.ts check [--allow-custom-codes]
//   node scripts/hub-build.ts build [--iterations N] [--fresh-salts] [--allow-custom-codes]
//
// Inputs are local only (ignored by git): hub/resources.local.json and
// hub/codes.local.json. Output: public/hub/bundle.json, which is public and
// committed. This tool never prints codes or resource URLs. See docs/HUB.md.

import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname } from "node:path"
import { parseArgs } from "node:util"
import { subteamIds, type SubteamId } from "../lib/subteams.ts"
import {
  allRoles,
  buildRolePayload,
  codeForRole,
  parseHubCodes,
  parseHubSource,
  roleKey,
  type HubCodes,
  type HubRole,
} from "../lib/hub/schema.ts"
import {
  createBundle,
  decryptWithKey,
  deriveKey,
  DEFAULT_ITERATIONS,
  fromBase64,
  parseHubBundle,
  randomBytes,
  unlockBundle,
  type BundleEntry,
  type HubBundle,
} from "../lib/hub/crypto.ts"

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    source: { type: "string", default: "hub/resources.local.json" },
    codes: { type: "string", default: "hub/codes.local.json" },
    out: { type: "string", default: "public/hub/bundle.json" },
    iterations: { type: "string", default: String(DEFAULT_ITERATIONS) },
    rotate: { type: "string" },
    "fresh-salts": { type: "boolean", default: false },
    "allow-custom-codes": { type: "boolean", default: false },
  },
})

const command = positionals[0]

async function readJson(path: string, what: string): Promise<unknown> {
  if (!existsSync(path)) throw new Error(`${what} not found at ${path}. See docs/HUB.md.`)
  const text = await readFile(path, "utf8")
  try {
    return JSON.parse(text)
  } catch {
    // The JSON.parse message quotes part of the input, which may be a code.
    throw new Error(`${what} at ${path} is not valid JSON.`)
  }
}

async function writeFileAtomic(path: string, contents: string, mode?: number) {
  await mkdir(dirname(path), { recursive: true })
  const temp = `${path}.tmp-${process.pid}`
  await writeFile(temp, contents, mode === undefined ? undefined : { mode })
  await rename(temp, path)
  if (mode !== undefined) await chmod(path, mode)
}

// 20 symbols from a 31-character alphabet without look-alikes (about 99 bits),
// grouped as xxxxx-xxxxx-xxxxx-xxxxx. Rejection sampling keeps it unbiased.
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
function generateCode(): string {
  for (;;) {
    const symbols: string[] = []
    while (symbols.length < 20) {
      const byte = randomBytes(1)[0]
      if (byte < alphabet.length * 8) symbols.push(alphabet[byte % alphabet.length])
    }
    const code = symbols.join("")
    if (/\d/.test(code)) return code.replace(/(.{5})(?=.)/g, "$1-")
  }
}

function roleFromName(name: string): HubRole {
  if (name === "general" || name === "leads") return { kind: name }
  if ((subteamIds as readonly string[]).includes(name)) return { kind: "subteam", subteam: name as SubteamId }
  throw new Error(`Unknown role "${name}". Use general, leads, or a subteam id: ${subteamIds.join(", ")}`)
}

async function codesCommand() {
  const path = values.codes!
  const exists = existsSync(path)
  if (!exists && values.rotate === undefined) {
    const codes: HubCodes = {
      general: generateCode(),
      leads: generateCode(),
      subteams: Object.fromEntries(subteamIds.map((id) => [id, generateCode()])) as Record<SubteamId, string>,
    }
    await writeFileAtomic(path, JSON.stringify(codes, null, 2) + "\n", 0o600)
    console.log(`Created ${path} with new codes for all ${allRoles().length} roles. Share them privately; never commit or post them.`)
    return
  }
  if (!exists) throw new Error(`${path} does not exist yet. Run "codes" without --rotate first.`)
  if (!values.rotate) throw new Error(`${path} already exists. Use --rotate <roles> or --rotate all to replace codes.`)

  const raw = await readJson(path, "Codes file")
  const roles = values.rotate === "all" ? allRoles() : values.rotate.split(",").map((name) => roleFromName(name.trim()))
  // Rotating also brings the file in line with lib/subteams.ts: subteams that
  // were added get a new code, and subteams that were removed are dropped.
  const { added, removed } = syncSubteamCodes(raw)
  for (const role of roles) {
    const record = raw as { general?: unknown; leads?: unknown; subteams: Record<string, unknown> }
    if (role.kind === "subteam") record.subteams[role.subteam] = generateCode()
    else record[role.kind] = generateCode()
  }
  const codes = parseHubCodes(raw, { allowCustom: values["allow-custom-codes"] })
  await writeFileAtomic(path, JSON.stringify(codes, null, 2) + "\n", 0o600)
  const rotated = [...new Set([...roles.map(roleKey), ...added.map((id) => `subteam:${id}`)])]
  console.log(`Rotated: ${rotated.join(", ")}. Run "build" next, then share the new codes privately.`)
  if (removed.length) console.log(`Removed codes for subteams no longer in lib/subteams.ts: ${removed.join(", ")}`)
}

/** Adds codes for new subteam ids and drops ids that no longer exist. Mutates `raw`. */
function syncSubteamCodes(raw: unknown): { added: SubteamId[]; removed: string[] } {
  if (typeof raw !== "object" || raw === null) throw new Error("Codes file must be a JSON object.")
  const record = raw as { subteams?: unknown }
  if (typeof record.subteams !== "object" || record.subteams === null) record.subteams = {}
  const subteams = record.subteams as Record<string, unknown>
  const removed = Object.keys(subteams).filter((id) => !(subteamIds as readonly string[]).includes(id))
  for (const id of removed) delete subteams[id]
  const added = subteamIds.filter((id) => subteams[id] === undefined)
  for (const id of added) subteams[id] = generateCode()
  return { added, removed }
}

async function loadInputs() {
  const source = parseHubSource(await readJson(values.source!, "Resource source"))
  const codes = parseHubCodes(await readJson(values.codes!, "Codes file"), { allowCustom: values["allow-custom-codes"] })
  return { source, codes }
}

function summarize(source: ReturnType<typeof parseHubSource>) {
  const subteamCounts = subteamIds.map((id) => `${id}=${source.subteams[id]?.length ?? 0}`).join(" ")
  return `general=${source.general.length} leads=${source.leads.length} ${subteamCounts}`
}

/**
 * Finds the salt a role used in the previous bundle, if its code still opens
 * that role's payload. A payload that opens but belongs to another role (codes
 * swapped by hand) or no longer validates gets a fresh salt instead.
 */
async function previousSalts(codes: HubCodes, iterations: number): Promise<Map<string, string>> {
  const salts = new Map<string, string>()
  if (values["fresh-salts"] || !existsSync(values.out!)) return salts
  let previous: HubBundle
  try {
    previous = parseHubBundle(JSON.parse(await readFile(values.out!, "utf8")))
  } catch {
    return salts
  }
  if (previous.kdf.iterations !== iterations) return salts
  await Promise.all(
    allRoles().map(async (role) => {
      const code = codeForRole(codes, role)
      for (const encrypted of previous.payloads) {
        const key = await deriveKey(code, fromBase64(encrypted.salt), iterations)
        const payload = await decryptWithKey(key, encrypted).catch(() => null)
        if (payload && roleKey(payload.role) === roleKey(role)) {
          salts.set(roleKey(role), encrypted.salt)
          return
        }
      }
    }),
  )
  return salts
}

async function buildCommand() {
  const iterations = Number(values.iterations)
  if (!Number.isInteger(iterations)) throw new Error("--iterations must be an integer")
  const { source, codes } = await loadInputs()
  const reused = await previousSalts(codes, iterations)

  const entries: BundleEntry[] = allRoles().map((role) => ({
    code: codeForRole(codes, role),
    payload: buildRolePayload(source, role),
    salt: reused.get(roleKey(role)),
  }))
  const bundle = await createBundle(entries, iterations)

  // Verify every code opens exactly its own role before writing anything.
  for (const role of allRoles()) {
    const result = await unlockBundle(bundle, codeForRole(codes, role))
    if (!result || roleKey(result.payload.role) !== roleKey(role)) throw new Error(`Verification failed for ${roleKey(role)}`)
  }

  await writeFileAtomic(values.out!, JSON.stringify(bundle) + "\n")
  const kept = allRoles().filter((role) => reused.has(roleKey(role))).map(roleKey)
  console.log(`Wrote ${values.out} (${bundle.payloads.length} payloads, ${iterations} PBKDF2 iterations).`)
  console.log(`Resources: ${summarize(source)}`)
  console.log(kept.length ? `Sessions kept for: ${kept.join(", ")}` : "All roles re-salted: every member must enter their code again.")
}

async function checkCommand() {
  const { source } = await loadInputs()
  console.log(`Source and codes are valid. Resources: ${summarize(source)}`)
}

const commands: Record<string, () => Promise<void>> = { codes: codesCommand, check: checkCommand, build: buildCommand }

const run = command ? commands[command] : undefined
if (!run) {
  console.error("Usage: node scripts/hub-build.ts <codes|check|build> [options]. See docs/HUB.md.")
  process.exit(2)
}
run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

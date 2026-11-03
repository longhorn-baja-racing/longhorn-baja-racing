// Hub bundle tool. Run with Node 22+ (TypeScript runs directly):
//
//   node scripts/hub-build.ts codes [--rotate all|general,leads,powertrain,...]
//   node scripts/hub-build.ts check
//   node scripts/hub-build.ts build [--iterations N] [--fresh-salts]
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
  },
})

const command = positionals[0]

async function readJson(path: string, what: string): Promise<unknown> {
  if (!existsSync(path)) throw new Error(`${what} not found at ${path}. See docs/HUB.md.`)
  return JSON.parse(await readFile(path, "utf8"))
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

  const codes = parseHubCodes(await readJson(path, "Codes file"))
  const roles = values.rotate === "all" ? allRoles() : values.rotate.split(",").map((name) => roleFromName(name.trim()))
  for (const role of roles) {
    if (role.kind === "subteam") codes.subteams[role.subteam] = generateCode()
    else codes[role.kind] = generateCode()
  }
  await writeFileAtomic(path, JSON.stringify(codes, null, 2) + "\n", 0o600)
  console.log(`Rotated: ${roles.map(roleKey).join(", ")}. Run "build" next, then share the new codes privately.`)
}

async function loadInputs() {
  const source = parseHubSource(await readJson(values.source!, "Resource source"))
  const codes = parseHubCodes(await readJson(values.codes!, "Codes file"))
  return { source, codes }
}

function summarize(source: ReturnType<typeof parseHubSource>) {
  const subteamCounts = subteamIds.map((id) => `${id}=${source.subteams[id]?.length ?? 0}`).join(" ")
  return `general=${source.general.length} leads=${source.leads.length} ${subteamCounts}`
}

/** Finds the salt a role used in the previous bundle, if its code still opens it. */
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
        if (await decryptWithKey(key, encrypted)) {
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

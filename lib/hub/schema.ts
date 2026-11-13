// Hub resource schema and access scopes.
//
// The plaintext resource list (HubSource) and the access codes (HubCodes) are
// local-only generation inputs and are never committed. scripts/hub-build.ts
// turns them into one encrypted payload per role. Each payload already holds
// the complete resource set for that role, so a member only ever enters one
// code, and a payload never contains resources outside its scope.

import { isSubteamId, subteamIds, type SubteamId } from "../subteams.ts"

export const PAYLOAD_VERSION = 1

export const resourceCategories = ["Drive", "Box", "Notes", "BOM", "Design", "Calendar", "Recruiting", "Other"] as const
export type ResourceCategory = (typeof resourceCategories)[number]

export type Resource = {
  /** Stable id, unique within its role payload. Lowercase letters, digits, dashes. */
  id: string
  label: string
  description?: string
  category: ResourceCategory
  /** https: or mailto: only. */
  url: string
  /** Optional icon name (lowercase, dashes), for example a lucide icon. */
  icon?: string
  /** Lower sorts first. Resources without an order sort after, by label. */
  order?: number
  /** Defaults to true for external links. */
  openInNewTab?: boolean
}

export type HubRole =
  | { kind: "general" }
  | { kind: "subteam"; subteam: SubteamId }
  | { kind: "leads" }

export type SubteamResources = Partial<Record<SubteamId, Resource[]>>

/** Decrypted contents of one role payload. */
export type HubPayload = {
  version: typeof PAYLOAD_VERSION
  role: HubRole
  general: Resource[]
  /** Present only in the leads payload. */
  leads?: Resource[]
  /** Subteam role: only its own subteam. Leads: every subteam. General: empty. */
  subteams: SubteamResources
}

/** Plaintext generation input. Local only, never committed. */
export type HubSource = {
  general: Resource[]
  leads: Resource[]
  subteams: SubteamResources
}

/** Access codes per role. Local only, never committed. */
export type HubCodes = {
  general: string
  leads: string
  subteams: Record<SubteamId, string>
}

export const MIN_CODE_LENGTH = 16

export class HubSchemaError extends Error {
  constructor(path: string, problem: string) {
    super(`${path}: ${problem}`)
    this.name = "HubSchemaError"
  }
}

const idPattern = /^[a-z0-9][a-z0-9-]*$/
const iconPattern = /^[a-z0-9][a-z0-9-]*$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function rejectUnknownKeys(value: Record<string, unknown>, allowed: readonly string[], path: string) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new HubSchemaError(`${path}.${key}`, "unknown field")
  }
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new HubSchemaError(path, "must be a non-empty string")
  return value
}

export function parseResource(value: unknown, path: string): Resource {
  if (!isRecord(value)) throw new HubSchemaError(path, "must be an object")
  rejectUnknownKeys(value, ["id", "label", "description", "category", "url", "icon", "order", "openInNewTab"], path)

  const id = requireString(value.id, `${path}.id`)
  if (!idPattern.test(id)) throw new HubSchemaError(`${path}.id`, "use lowercase letters, digits, and dashes")

  const category = value.category
  if (typeof category !== "string" || !(resourceCategories as readonly string[]).includes(category)) {
    throw new HubSchemaError(`${path}.category`, `must be one of ${resourceCategories.join(", ")}`)
  }

  const url = requireString(value.url, `${path}.url`)
  let protocol: string
  try {
    protocol = new URL(url).protocol
  } catch {
    throw new HubSchemaError(`${path}.url`, "must be an absolute URL")
  }
  if (protocol !== "https:" && protocol !== "mailto:") throw new HubSchemaError(`${path}.url`, "must use https: or mailto:")

  const resource: Resource = { id, label: requireString(value.label, `${path}.label`), category: category as ResourceCategory, url }

  if (value.description !== undefined) resource.description = requireString(value.description, `${path}.description`)
  if (value.icon !== undefined) {
    const icon = requireString(value.icon, `${path}.icon`)
    if (!iconPattern.test(icon)) throw new HubSchemaError(`${path}.icon`, "use lowercase letters, digits, and dashes")
    resource.icon = icon
  }
  if (value.order !== undefined) {
    if (typeof value.order !== "number" || !Number.isFinite(value.order)) throw new HubSchemaError(`${path}.order`, "must be a number")
    resource.order = value.order
  }
  if (value.openInNewTab !== undefined) {
    if (typeof value.openInNewTab !== "boolean") throw new HubSchemaError(`${path}.openInNewTab`, "must be true or false")
    resource.openInNewTab = value.openInNewTab
  }
  return resource
}

function parseResourceList(value: unknown, path: string): Resource[] {
  if (!Array.isArray(value)) throw new HubSchemaError(path, "must be an array")
  const resources = value.map((item, index) => parseResource(item, `${path}[${index}]`))
  const seen = new Set<string>()
  for (const resource of resources) {
    if (seen.has(resource.id)) throw new HubSchemaError(path, `duplicate resource id "${resource.id}"`)
    seen.add(resource.id)
  }
  return resources
}

/**
 * With `dropUnknown`, entries for subteam ids that are not in lib/subteams.ts
 * are skipped instead of rejected. Decrypted payloads use this, so renaming or
 * removing a subteam does not lock the leads out of an older bundle.
 */
function parseSubteamResources(value: unknown, path: string, dropUnknown = false): SubteamResources {
  if (!isRecord(value)) throw new HubSchemaError(path, "must be an object keyed by subteam id")
  const result: SubteamResources = {}
  for (const [key, list] of Object.entries(value)) {
    if (!isSubteamId(key)) {
      if (dropUnknown) continue
      throw new HubSchemaError(`${path}.${key}`, `unknown subteam id (expected one of ${subteamIds.join(", ")})`)
    }
    result[key] = parseResourceList(list, `${path}.${key}`)
  }
  return result
}

export function parseHubSource(value: unknown): HubSource {
  if (!isRecord(value)) throw new HubSchemaError("source", "must be an object")
  rejectUnknownKeys(value, ["$schema", "general", "leads", "subteams"], "source")
  return {
    general: parseResourceList(value.general, "source.general"),
    leads: parseResourceList(value.leads ?? [], "source.leads"),
    subteams: parseSubteamResources(value.subteams ?? {}, "source.subteams"),
  }
}

function parseRole(value: unknown): HubRole {
  if (!isRecord(value)) throw new HubSchemaError("payload.role", "must be an object")
  if (value.kind === "general" || value.kind === "leads") return { kind: value.kind }
  if (value.kind === "subteam" && isSubteamId(value.subteam)) return { kind: "subteam", subteam: value.subteam }
  throw new HubSchemaError("payload.role", "invalid role")
}

/**
 * Validates a decrypted payload, including that it holds nothing outside its
 * role's scope. Successful authenticated decryption plus this check is what
 * proves an access code correct.
 */
export function parseHubPayload(value: unknown): HubPayload {
  if (!isRecord(value)) throw new HubSchemaError("payload", "must be an object")
  rejectUnknownKeys(value, ["version", "role", "general", "leads", "subteams"], "payload")
  if (value.version !== PAYLOAD_VERSION) throw new HubSchemaError("payload.version", `expected ${PAYLOAD_VERSION}`)

  const role = parseRole(value.role)
  const payload: HubPayload = {
    version: PAYLOAD_VERSION,
    role,
    general: parseResourceList(value.general, "payload.general"),
    subteams: parseSubteamResources(value.subteams ?? {}, "payload.subteams", true),
  }
  if (value.leads !== undefined) payload.leads = parseResourceList(value.leads, "payload.leads")

  // Scope checks use the raw keys, so an unknown id is still out of scope.
  const subteamKeys = isRecord(value.subteams) ? Object.keys(value.subteams) : []
  if (role.kind !== "leads" && payload.leads !== undefined) throw new HubSchemaError("payload.leads", "only allowed in the leads payload")
  if (role.kind === "leads" && payload.leads === undefined) throw new HubSchemaError("payload.leads", "required in the leads payload")
  if (role.kind === "general" && subteamKeys.length > 0) throw new HubSchemaError("payload.subteams", "must be empty for the general role")
  if (role.kind === "subteam" && subteamKeys.some((key) => key !== role.subteam)) {
    throw new HubSchemaError("payload.subteams", `may only contain "${role.subteam}"`)
  }
  return payload
}

/** Every role in a fixed order: general, each subteam, leads. */
export function allRoles(): HubRole[] {
  return [{ kind: "general" }, ...subteamIds.map((subteam) => ({ kind: "subteam" as const, subteam })), { kind: "leads" }]
}

export function roleKey(role: HubRole): string {
  return role.kind === "subteam" ? `subteam:${role.subteam}` : role.kind
}

/** Builds the scoped payload for one role from the full source. */
export function buildRolePayload(source: HubSource, role: HubRole): HubPayload {
  if (role.kind === "general") return { version: PAYLOAD_VERSION, role, general: source.general, subteams: {} }
  if (role.kind === "subteam") {
    const own = source.subteams[role.subteam]
    return { version: PAYLOAD_VERSION, role, general: source.general, subteams: own ? { [role.subteam]: own } : {} }
  }
  const subteams: SubteamResources = {}
  for (const id of subteamIds) {
    const list = source.subteams[id]
    if (list) subteams[id] = list
  }
  return { version: PAYLOAD_VERSION, role, general: source.general, leads: source.leads, subteams }
}

/** Normalizes a code the same way at build time and unlock time. */
export function normalizeCode(code: string): string {
  return code.normalize("NFC").trim()
}

export function codeForRole(codes: HubCodes, role: HubRole): string {
  if (role.kind === "subteam") return codes.subteams[role.subteam]
  return codes[role.kind]
}

/** The format `npm run hub -- codes` generates: 4 groups of 5, about 99 bits. */
export const GENERATED_CODE_PATTERN = /^(?:[a-hjkmnp-z2-9]{5}-){3}[a-hjkmnp-z2-9]{5}$/

export type ParseCodesOptions = {
  /** Accept hand-picked codes instead of only generated ones. */
  allowCustom?: boolean
}

export function parseHubCodes(value: unknown, options: ParseCodesOptions = {}): HubCodes {
  if (!isRecord(value)) throw new HubSchemaError("codes", "must be an object")
  rejectUnknownKeys(value, ["general", "leads", "subteams"], "codes")
  if (!isRecord(value.subteams)) throw new HubSchemaError("codes.subteams", "must be an object keyed by subteam id")
  rejectUnknownKeys(value.subteams, subteamIds, "codes.subteams")

  const subteams = {} as Record<SubteamId, string>
  for (const id of subteamIds) subteams[id] = requireString(value.subteams[id], `codes.subteams.${id}`)
  const codes: HubCodes = {
    general: requireString(value.general, "codes.general"),
    leads: requireString(value.leads, "codes.leads"),
    subteams,
  }

  const seen = new Map<string, string>()
  for (const role of allRoles()) {
    const key = roleKey(role)
    const code = normalizeCode(codeForRole(codes, role))
    if (code.length < MIN_CODE_LENGTH) throw new HubSchemaError(`codes ${key}`, `must be at least ${MIN_CODE_LENGTH} characters`)
    if (/^[a-z ]+$/i.test(code)) throw new HubSchemaError(`codes ${key}`, "must not be letters only; mix in digits or symbols")
    if (!options.allowCustom && !GENERATED_CODE_PATTERN.test(code)) {
      throw new HubSchemaError(`codes ${key}`, "is not a generated code; rotate it with \"codes --rotate\", or pass --allow-custom-codes")
    }
    const duplicate = seen.get(code)
    if (duplicate) throw new HubSchemaError(`codes ${key}`, `same code as ${duplicate}`)
    seen.set(code, key)
  }
  return codes
}

/** Sorts by order (missing last), then label. Does not mutate the input. */
export function sortResources(resources: readonly Resource[]): Resource[] {
  return [...resources].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.label.localeCompare(b.label))
}

// Encrypted hub bundle: one AES-GCM payload per role, each keyed by
// PBKDF2-SHA256 over that role's access code with its own random salt.
//
// Runs unchanged in browsers and in Node 22+ (both expose Web Crypto as
// globalThis.crypto). There are no password verifiers: the only way to test a
// code is to derive the key and attempt authenticated decryption.
//
// This is a privacy barrier for team links on a static site, not server-side
// authentication. The bundle is public, so codes can be attacked offline;
// see docs/HUB.md for the threat model and code requirements.

import { normalizeCode, parseHubPayload, type HubPayload } from "./schema.ts"

export const BUNDLE_VERSION = 1
export const DEFAULT_ITERATIONS = 600_000
export const MIN_ITERATIONS = 100_000
const MAX_ITERATIONS = 10_000_000
const MAX_PAYLOADS = 32
const SALT_BYTES = 16
const IV_BYTES = 12
/** Bound into every ciphertext, so payloads cannot be moved between formats. */
const ADDITIONAL_DATA = new TextEncoder().encode(`lbr-hub:v${BUNDLE_VERSION}`)

export type EncryptedPayload = {
  /** base64, 16 bytes, unique per role */
  salt: string
  /** base64, 12 bytes, fresh per encryption */
  iv: string
  /** base64 AES-GCM ciphertext with tag */
  data: string
}

export type HubBundle = {
  version: typeof BUNDLE_VERSION
  kdf: { name: "PBKDF2"; hash: "SHA-256"; iterations: number }
  cipher: "AES-GCM"
  /** Shuffled at build time so the position does not reveal the role. */
  payloads: EncryptedPayload[]
}

export type UnlockResult = {
  payload: HubPayload
  /** Non-extractable key. Can be stored in IndexedDB to restore a session. */
  key: CryptoKey
  /** Salt of the payload this key opens, used to find it again after a rebuild. */
  salt: string
}

const subtle = () => globalThis.crypto.subtle

export function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return globalThis.crypto.getRandomValues(new Uint8Array(length))
}

export async function deriveKey(code: string, salt: Uint8Array<ArrayBuffer>, iterations: number, extractable = false): Promise<CryptoKey> {
  const material = await subtle().importKey("raw", new TextEncoder().encode(normalizeCode(code)), "PBKDF2", false, ["deriveKey"])
  return subtle().deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    extractable,
    ["encrypt", "decrypt"],
  )
}

export async function encryptWithKey(key: CryptoKey, salt: Uint8Array<ArrayBuffer>, payload: HubPayload): Promise<EncryptedPayload> {
  const iv = randomBytes(IV_BYTES)
  const plaintext = new TextEncoder().encode(JSON.stringify(payload))
  const data = new Uint8Array(await subtle().encrypt({ name: "AES-GCM", iv, additionalData: ADDITIONAL_DATA }, key, plaintext))
  return { salt: toBase64(salt), iv: toBase64(iv), data: toBase64(data) }
}

/** Returns the payload, or null when the key does not open it or the contents are invalid. */
export async function decryptWithKey(key: CryptoKey, encrypted: EncryptedPayload): Promise<HubPayload | null> {
  try {
    const plaintext = await subtle().decrypt(
      { name: "AES-GCM", iv: fromBase64(encrypted.iv), additionalData: ADDITIONAL_DATA },
      key,
      fromBase64(encrypted.data),
    )
    return parseHubPayload(JSON.parse(new TextDecoder().decode(plaintext)))
  } catch {
    return null
  }
}

/** Validates the public outer structure of a downloaded bundle. */
export function parseHubBundle(value: unknown): HubBundle {
  const fail = (problem: string): never => {
    throw new Error(`Invalid hub bundle: ${problem}`)
  }
  if (typeof value !== "object" || value === null) fail("not an object")
  const bundle = value as Record<string, unknown>
  if (bundle.version !== BUNDLE_VERSION) fail(`unsupported version ${String(bundle.version)}`)
  const kdf = bundle.kdf as Record<string, unknown> | undefined
  if (!kdf || kdf.name !== "PBKDF2" || kdf.hash !== "SHA-256") fail("unsupported kdf")
  const iterations = kdf!.iterations
  if (typeof iterations !== "number" || !Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) {
    fail("iterations out of range")
  }
  if (bundle.cipher !== "AES-GCM") fail("unsupported cipher")
  if (!Array.isArray(bundle.payloads) || bundle.payloads.length === 0 || bundle.payloads.length > MAX_PAYLOADS) fail("bad payload list")
  const payloads = (bundle.payloads as unknown[]).map((item, index) => {
    const entry = item as Record<string, unknown> | null
    const ok =
      entry !== null &&
      typeof entry === "object" &&
      typeof entry.salt === "string" &&
      typeof entry.iv === "string" &&
      typeof entry.data === "string" &&
      fromBase64(entry.salt).length === SALT_BYTES &&
      fromBase64(entry.iv).length === IV_BYTES
    if (!ok) fail(`payload ${index} is malformed`)
    return { salt: entry!.salt as string, iv: entry!.iv as string, data: entry!.data as string }
  })
  return { version: BUNDLE_VERSION, kdf: { name: "PBKDF2", hash: "SHA-256", iterations: iterations as number }, cipher: "AES-GCM", payloads }
}

/**
 * Tries the code against every payload (bounded by MAX_PAYLOADS, derivations
 * run concurrently) and returns the one that decrypts and validates, or null.
 * The caller should show one generic error for null and never log the code.
 */
export async function unlockBundle(bundle: HubBundle, code: string): Promise<UnlockResult | null> {
  if (normalizeCode(code) === "") return null
  const attempts = bundle.payloads.map(async (encrypted) => {
    const key = await deriveKey(code, fromBase64(encrypted.salt), bundle.kdf.iterations)
    const payload = await decryptWithKey(key, encrypted)
    return payload ? { payload, key, salt: encrypted.salt } : null
  })
  const results = await Promise.all(attempts)
  return results.find((result) => result !== null) ?? null
}

/**
 * Re-opens a bundle with a key saved from an earlier unlock. Returns null if
 * that role's payload was re-salted (its code was rotated) or removed.
 */
export async function reopenBundle(bundle: HubBundle, key: CryptoKey, salt: string): Promise<HubPayload | null> {
  const encrypted = bundle.payloads.find((entry) => entry.salt === salt)
  return encrypted ? decryptWithKey(key, encrypted) : null
}

/** Fisher-Yates shuffle using the platform CSPRNG. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export type BundleEntry = {
  code: string
  payload: HubPayload
  /** Reuse this salt (base64) to keep existing sessions for this role valid. */
  salt?: string
}

export async function createBundle(entries: readonly BundleEntry[], iterations = DEFAULT_ITERATIONS): Promise<HubBundle> {
  if (iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) throw new Error("iterations out of range")
  if (entries.length === 0 || entries.length > MAX_PAYLOADS) throw new Error("bad number of payloads")
  const payloads = await Promise.all(
    entries.map(async (entry) => {
      const salt = entry.salt ? fromBase64(entry.salt) : randomBytes(SALT_BYTES)
      if (salt.length !== SALT_BYTES) throw new Error("bad salt length")
      const key = await deriveKey(entry.code, salt, iterations)
      return encryptWithKey(key, salt, entry.payload)
    }),
  )
  const salts = new Set(payloads.map((payload) => payload.salt))
  if (salts.size !== payloads.length) throw new Error("salts must be unique per payload")
  return { version: BUNDLE_VERSION, kdf: { name: "PBKDF2", hash: "SHA-256", iterations }, cipher: "AES-GCM", payloads: shuffle(payloads) }
}

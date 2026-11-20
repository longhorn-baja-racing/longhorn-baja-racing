// Remembered hub session for one browser profile.
//
// Stores only what is needed to reopen the bundle: the non-extractable
// CryptoKey from unlockBundle(), the salt of the payload it opens, and an
// expiry. Never the access code, and never the decrypted links. A CryptoKey
// cannot be read out of IndexedDB, only used, so a copied storage dump is
// useless without this browser profile. Anyone using this profile can still
// open the hub until logout or expiry.

const DB_NAME = "lbr-hub"
const STORE = "session"
const RECORD_KEY = "current"
/** Bump to invalidate every saved session after a format change. */
export const SESSION_VERSION = 1
export const SESSION_DAYS = 30
const LEADS_SUBTEAM_KEY = `lbr-hub:v${SESSION_VERSION}:leads-subteam`

export type StoredSession = {
  version: number
  key: CryptoKey
  salt: string
  expiresAt: number
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return inStore(await openDatabase(), mode, action)
}

async function inStore<T>(db: IDBDatabase, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE, mode)
      const request = action(transaction.objectStore(STORE))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function saveSession(key: CryptoKey, salt: string, now = Date.now()): Promise<void> {
  const session: StoredSession = { version: SESSION_VERSION, key, salt, expiresAt: now + SESSION_DAYS * 86_400_000 }
  await withStore("readwrite", (store) => store.put(session, RECORD_KEY))
}

/** Returns a valid session, or null (and clears it) when missing, expired, or from an old version. */
export async function loadSession(now = Date.now()): Promise<StoredSession | null> {
  try {
    const session = (await withStore("readonly", (store) => store.get(RECORD_KEY))) as StoredSession | undefined
    const valid =
      session !== undefined &&
      session.version === SESSION_VERSION &&
      session.key instanceof CryptoKey &&
      typeof session.salt === "string" &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > now
    if (valid) return session
    // Unusable either way, so a failed delete here changes nothing.
    if (session !== undefined) await clearSession().catch(() => undefined)
    return null
  } catch {
    return null
  }
}

/**
 * Log out / switch team: removes the saved key and the leads subteam choice.
 * Rejects when a saved key may remain (the database opens but the delete
 * fails), because a later visit could then still reopen the hub. Callers must
 * not report the logout as complete in that case.
 */
export async function clearSession(): Promise<void> {
  try {
    localStorage.removeItem(LEADS_SUBTEAM_KEY)
  } catch {
    // Storage can be unavailable (private mode); nothing to clear then.
  }
  let db: IDBDatabase
  try {
    db = await openDatabase()
  } catch {
    // No usable IndexedDB (storage blocked, some private modes): no key can
    // have been saved, and a reload could not read one either.
    return
  }
  await inStore(db, "readwrite", (store) => store.delete(RECORD_KEY))
}

export function loadLeadsSubteam(): string | null {
  try {
    return localStorage.getItem(LEADS_SUBTEAM_KEY)
  } catch {
    return null
  }
}

export function saveLeadsSubteam(id: string): void {
  try {
    localStorage.setItem(LEADS_SUBTEAM_KEY, id)
  } catch {
    // Convenience only.
  }
}

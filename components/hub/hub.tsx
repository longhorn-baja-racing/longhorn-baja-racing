"use client"

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react"
import HubDashboard from "@/components/hub/hub-dashboard"
import { HubBundleOutdatedError, parseHubBundle, reopenBundle, unlockBundle, type HubBundle } from "@/lib/hub/crypto"
import type { HubPayload } from "@/lib/hub/schema"
import { clearSession, loadSession, saveSession, SESSION_DAYS } from "@/lib/hub/session"

type State =
  | { kind: "checking" }
  | { kind: "not-set-up" }
  | { kind: "error" }
  | { kind: "outdated" }
  | { kind: "locked"; bundle: HubBundle; notice?: string }
  | { kind: "unlocked"; bundle: HubBundle; payload: HubPayload; remembered: boolean; focus: boolean }

const OUTDATED_MESSAGE =
  "Your code is correct, but the hub has not been updated for a recent subteam change yet. Ask a lead to rebuild the hub, then try again."

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""

async function fetchBundle(): Promise<HubBundle | "missing"> {
  const response = await fetch(`${base}/hub/bundle.json`, { cache: "no-cache" })
  if (response.status === 404) return "missing"
  if (!response.ok) throw new Error(`Hub bundle request failed: ${response.status}`)
  return parseHubBundle(await response.json())
}

export default function Hub() {
  const [state, setState] = useState<State>({ kind: "checking" })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const bundle = await fetchBundle()
        if (!active) return
        if (bundle === "missing") return setState({ kind: "not-set-up" })
        const session = await loadSession()
        const payload = session ? await reopenBundle(bundle, session.key, session.salt) : null
        if (!active) return
        if (session && !payload) await clearSession()
        setState(payload ? { kind: "unlocked", bundle, payload, remembered: true, focus: false } : { kind: "locked", bundle })
      } catch (error) {
        // An outdated bundle keeps the saved session, so it works again after the rebuild.
        if (active) setState({ kind: error instanceof HubBundleOutdatedError ? "outdated" : "error" })
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const lock = useCallback(async (notice?: string) => {
    await clearSession()
    setState((current) => (current.kind === "unlocked" ? { kind: "locked", bundle: current.bundle, notice } : current))
  }, [])

  if (state.kind === "checking") {
    return (
      <p role="status" aria-live="polite" className="text-white/65">
        Loading the hub...
      </p>
    )
  }
  if (state.kind === "not-set-up") {
    return (
      <p role="status" className="hub-panel max-w-xl p-6 leading-7 text-white/70">
        The team hub is not set up yet. Check back soon, or ask a lead for the link you need.
      </p>
    )
  }
  if (state.kind === "error") {
    return (
      <p role="alert" className="hub-panel max-w-xl p-6 leading-7 text-white/70">
        The hub could not be loaded right now. Refresh the page to try again.
      </p>
    )
  }
  if (state.kind === "outdated") {
    return (
      <p role="alert" className="hub-panel max-w-xl p-6 leading-7 text-white/70">
        {OUTDATED_MESSAGE}
      </p>
    )
  }
  if (state.kind === "locked") {
    return (
      <AccessForm
        bundle={state.bundle}
        notice={state.notice}
        onUnlock={(payload, remembered) => setState({ kind: "unlocked", bundle: state.bundle, payload, remembered, focus: true })}
      />
    )
  }
  return (
    <HubDashboard
      payload={state.payload}
      remembered={state.remembered}
      focusHeading={state.focus}
      onLogOut={() => lock("You are logged out. This device no longer has hub access.")}
      onSwitchTeam={() => lock("Enter the access code for the team you want to switch to.")}
    />
  )
}

type Failure = "wrong-code" | "outdated"

function AccessForm({
  bundle,
  notice,
  onUnlock,
}: {
  bundle: HubBundle
  notice?: string
  onUnlock: (payload: HubPayload, remembered: boolean) => void
}) {
  const [code, setCode] = useState("")
  const [visible, setVisible] = useState(false)
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<Failure | null>(null)
  // Filled in after mount, so screen readers announce it from the already
  // present live region instead of missing it while focus moves.
  const [announced, setAnnounced] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const ids = { code: useId(), error: useId(), note: useId() }

  useEffect(() => input.current?.focus(), [])

  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(notice ?? ""), 100)
    return () => window.clearTimeout(timer)
  }, [notice])

  // Runs after the re-render that ends `busy`, so focus returns to the input.
  useEffect(() => {
    if (!busy && failure) input.current?.select()
  }, [busy, failure])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !code.trim()) return
    setBusy(true)
    setFailure(null)
    let result: Awaited<ReturnType<typeof unlockBundle>> = null
    let outdated = false
    try {
      result = await unlockBundle(bundle, code)
    } catch (error) {
      outdated = error instanceof HubBundleOutdatedError
    }
    if (!result) {
      setBusy(false)
      setFailure(outdated ? "outdated" : "wrong-code")
      return
    }
    setCode("")
    if (remember) await saveSession(result.key, result.salt).catch(() => undefined)
    onUnlock(result.payload, remember)
  }

  const failed = failure !== null

  return (
    <form onSubmit={submit} className="hub-panel max-w-xl p-6 md:p-8" aria-busy={busy} noValidate>
      <p role="status" className={announced ? "mb-5 border-l-2 border-primary pl-3 text-sm text-white/80" : "sr-only"}>
        {announced}
      </p>
      <h2 className="text-4xl text-white">Unlock the hub</h2>
      <p id={ids.note} className="mt-3 text-sm leading-6 text-white/65">
        For Longhorn Baja members and leads. Enter the access code for your subteam, the general team, or leads. Ask your lead if you do not have it.
      </p>

      <label htmlFor={ids.code} className="mt-6 block text-xs font-bold uppercase tracking-[0.18em] text-white/80">
        Access code
      </label>
      <div className="mt-2 flex">
        <input
          ref={input}
          id={ids.code}
          name="access-code"
          type={visible ? "text" : "password"}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          readOnly={busy}
          aria-invalid={failed}
          aria-describedby={failed ? `${ids.error} ${ids.note}` : ids.note}
          className="hub-input min-w-0 flex-1"
        />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-pressed={visible}
          aria-controls={ids.code}
          className="hub-input-toggle"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {failed && (
        <p id={ids.error} role="alert" className="mt-3 text-sm font-semibold text-[#ffb37a]">
          {failure === "outdated" ? OUTDATED_MESSAGE : "That code did not work. Check it and try again."}
        </p>
      )}

      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-white/70">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="mt-1 h-4 w-4 accent-[#bf5700]" />
        <span>Remember this device for {SESSION_DAYS} days. Turn this off on shared or public computers.</span>
      </label>

      <button type="submit" disabled={busy || !code.trim()} className="action-link mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {busy ? "Unlocking..." : "Unlock"}
      </button>
    </form>
  )
}

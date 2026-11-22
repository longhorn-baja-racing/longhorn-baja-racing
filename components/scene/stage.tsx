"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Sticky full-screen canvas behind the hero and subteam sections. three.js
 * loads in its own chunk after the page is interactive, so text and images
 * paint first. Without WebGL the page keeps its static glow background.
 */
export default function Stage() {
  const host = useRef<HTMLDivElement>(null)
  const callout = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<"idle" | "ready" | "off">("idle")

  useEffect(() => {
    const el = host.current
    const track = el?.closest<HTMLElement>("[data-scene-track]")
    if (!el || !track) return
    let disposed = false
    let engine: { dispose: () => void } | null = null
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    const lowPower = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || !!nav.connection?.saveData

    const boot = () => {
      import("./engine")
        .then(({ createEngine }) => {
          if (disposed) return
          engine = createEngine({
            host: el,
            track,
            callout: callout.current,
            reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            lowPower,
            force: new URLSearchParams(window.location.search).get("3d") === "force",
            onReady: () => setState("ready"),
            onLost: () => setState("off"),
          })
          if (!engine) setState("off")
        })
        .catch(() => setState("off"))
    }
    const idle = "requestIdleCallback" in window
    const handle = idle ? window.requestIdleCallback(boot, { timeout: 1500 }) : window.setTimeout(boot, 300)
    return () => {
      disposed = true
      if (idle) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
      engine?.dispose()
    }
  }, [])

  return (
    <div className="stage" data-state={state} aria-hidden="true">
      <div className="stage-glow" />
      <div ref={host} className="stage-canvas" />
      <div ref={callout} className="stage-callout">
        <span className="stage-callout-dot" />
        <span className="stage-callout-line" />
        <span className="stage-callout-text" data-callout-text />
      </div>
    </div>
  )
}

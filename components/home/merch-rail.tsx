"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/** Horizontal, scroll-snapping product rail with previous / next buttons. */
export default function MerchRail({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLUListElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  useEffect(() => {
    const el = rail.current
    if (!el) return
    const update = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const move = (dir: 1 | -1) => {
    const el = rail.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <div className="rail">
      <ul ref={rail} className="rail-track" aria-label="Featured merch">
        {children}
      </ul>
      <div className="shell rail-controls">
        <button type="button" className="rail-button" onClick={() => move(-1)} disabled={edge.start} aria-label="Previous items">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" className="rail-button" onClick={() => move(1)} disabled={edge.end} aria-label="Next items">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"
import { createPortal } from "react-dom"
import { asset } from "@/lib/site"
import { createParticles, type ParticleLayer } from "./particles"
import type { ActiveSeason } from "./use-season"

type Look = "autumn" | "winter" | "christmas"

const strips: Record<Look, { label: string; title: string }> = {
  autumn: { label: "Shake the autumn vine to release leaves", title: "Click to shake down some leaves" },
  winter: { label: "Shake the snow loose", title: "Click to let it snow" },
  christmas: { label: "Jingle the lights to let it snow", title: "Click to let it snow" },
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

// December: a soft snow drift resting along the bottom edge of the header.
const snowDrift = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="22" viewBox="0 0 320 22"><path d="M0 0H320V6C300 6 296 14 276 13S250 5 228 7 196 17 172 14 140 4 116 6 86 15 62 13 30 5 0 6Z" fill="#f4f6fb"/><path d="M0 0H320V3C292 3 280 8 250 7S200 3 170 5 120 9 90 7 40 3 0 3Z" fill="#ffffff"/></svg>`)

// Christmas week: a wire of lights, with a few baubles hanging here and there.
const wire = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30" viewBox="0 0 200 30" preserveAspectRatio="none"><path d="M0 4 Q100 40 200 4" fill="none" stroke="#2a2622" stroke-width="2"/></svg>`)
const bulbs = Array.from({ length: 28 }, (_, i) => {
  const t = (i + 0.5) / 28
  const local = (t * 7) % 1
  return { left: t * 100, top: 4 + Math.sin(local * Math.PI) * 14, color: ["#ff3b30", "#fff4e0", "#34c759", "#ffcc33"][i % 4], delay: (i * 0.37) % 2.4 }
})
const baubles = [
  { left: 9, drop: 26, color: "#c62828" },
  { left: 31, drop: 40, color: "#d4a017" },
  { left: 58, drop: 30, color: "#2e7d32" },
  { left: 83, drop: 44, color: "#c62828" },
]

export default function SeasonalDecor({ active }: { active: ActiveSeason | null }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const layer = useRef<ParticleLayer | null>(null)
  const [bursts, setBursts] = useState(0)
  const id = active?.season.id
  const look: Look | null = !active ? null : active.season.id === "winter" ? (active.highlight ? "christmas" : "winter") : "autumn"

  useEffect(() => {
    if (!id || !canvas.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    layer.current = createParticles(canvas.current, id)
    return () => {
      layer.current?.dispose()
      layer.current = null
    }
  }, [id])

  if (!active || !id || !look) return null
  const strip = strips[look]

  function shake(event: MouseEvent<HTMLButtonElement>) {
    if (!layer.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.detail === 0 ? bounds.left + bounds.width / 2 : event.clientX
    layer.current.burst(x, bounds.top + bounds.height * 0.6)
    setBursts((n) => n + 1)
  }

  return (
    <>
      <button type="button" className={`season-strip season-strip--${look}`} aria-label={strip.label} title={strip.title} data-bursts={bursts} onClick={shake}
        style={{ "--garland-image": `url("${asset("/autumn/garland.webp")}")`, "--drift-image": snowDrift, "--wire-image": wire } as CSSProperties}>
        {look === "autumn" && <span className="season-vine" aria-hidden="true" />}
        {look === "winter" && <span className="season-drift" aria-hidden="true" />}
        {look === "christmas" && (
          <span className="season-lights" aria-hidden="true">
            {bulbs.map((b, i) => (
              <span key={i} className="season-bulb" style={{ left: `${b.left}%`, top: `${b.top}px`, "--bulb": b.color, animationDelay: `${-b.delay}s` } as CSSProperties} />
            ))}
            {baubles.map((b, i) => (
              <span key={i} className="season-bauble" style={{ left: `${b.left}%`, "--drop": `${b.drop}px`, "--bauble": b.color, animationDelay: `${-i * 0.9}s` } as CSSProperties} />
            ))}
          </span>
        )}
      </button>
      {look === "christmas" && (
        <svg className="season-hat" viewBox="0 0 40 30" aria-hidden="true">
          <path d="M6 22C9 11 18 3 29 5c4 1 6 5 5 9-3-3-7-4-10-2-4 3-6 7-8 12Z" fill="#c62828" />
          <rect x="3" y="20" width="22" height="7" rx="3.5" fill="#f5f5f5" transform="rotate(-8 14 23)" />
          <circle cx="34" cy="15" r="4" fill="#f5f5f5" />
        </svg>
      )}
      {typeof document !== "undefined" && createPortal(<canvas ref={canvas} className="season-particles" aria-hidden="true" />, document.body)}
    </>
  )
}

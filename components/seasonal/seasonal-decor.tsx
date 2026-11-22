"use client"

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"
import { createPortal } from "react-dom"
import { asset } from "@/lib/site"
import type { SeasonId } from "@/lib/seasons"
import { createParticles, type ParticleLayer } from "./particles"
import type { ActiveSeason } from "./use-season"

const strips: Partial<Record<SeasonId, { label: string; title: string }>> = {
  autumn: { label: "Shake the autumn vine to release leaves", title: "Click to shake down some leaves" },
  winter: { label: "Jingle the lights to let it snow", title: "Click to let it snow" },
  bluebonnets: { label: "Shake the bluebonnets loose", title: "Click to scatter some petals" },
}

// Spring vine: a wavy stem with bluebonnet clusters and leaves, tiled along the header.
const bluebonnetVine = (() => {
  const florets = (cx: number, cy: number) => {
    let out = ""
    for (let i = 0; i < 7; i++) {
      const y = cy + i * 3.2, r = 2.6 - i * 0.25
      out += `<circle cx="${cx - r * 0.7}" cy="${y}" r="${r}" fill="#3b5bdb"/><circle cx="${cx + r * 0.7}" cy="${y + 1.2}" r="${r}" fill="#4c6ef5"/>`
    }
    return out + `<circle cx="${cx}" cy="${cy + 23}" r="1.8" fill="#f8f9fa"/>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="44" viewBox="0 0 240 44">
    <path d="M0 8 C40 18 80 0 120 8 S200 18 240 8" fill="none" stroke="#2f5d32" stroke-width="2.2"/>
    <path d="M30 12 q8 10 2 18 q-8 -8 -2 -18Z M150 10 q10 8 6 17 q-9 -6 -6 -17Z M200 13 q-9 8 -4 16 q8 -7 4 -16Z" fill="#3d7a3f"/>
    ${florets(62, 12)}${florets(108, 9)}${florets(176, 13)}${florets(226, 10)}
  </svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

const bulbs = Array.from({ length: 28 }, (_, i) => {
  const t = (i + 0.5) / 28
  const local = (t * 7) % 1
  return { left: t * 100, top: 4 + Math.sin(local * Math.PI) * 14, color: ["#ff9a3d", "#fff4e0", "#ffcf6b", "#ff6a13"][i % 4], delay: (i * 0.37) % 2.4 }
})
const winterWire = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30" viewBox="0 0 200 30" preserveAspectRatio="none"><path d="M0 4 Q100 40 200 4" fill="none" stroke="#2a2622" stroke-width="2"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

export default function SeasonalDecor({ active }: { active: ActiveSeason | null }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const layer = useRef<ParticleLayer | null>(null)
  const [bursts, setBursts] = useState(0)
  const id = active?.season.id

  useEffect(() => {
    if (!id || !canvas.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    layer.current = createParticles(canvas.current, id)
    return () => {
      layer.current?.dispose()
      layer.current = null
    }
  }, [id])

  if (!active || !id) return null
  const strip = strips[id]

  function shake(event: MouseEvent<HTMLButtonElement>) {
    if (!layer.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.detail === 0 ? bounds.left + bounds.width / 2 : event.clientX
    layer.current.burst(x, bounds.top + bounds.height * 0.6)
    setBursts((n) => n + 1)
  }

  return (
    <>
      {strip && (
        <button type="button" className={`season-strip season-strip--${id}`} aria-label={strip.label} title={strip.title} data-bursts={bursts} onClick={shake}
          style={{ "--garland-image": `url("${asset("/autumn/garland.webp")}")`, "--bluebonnet-image": bluebonnetVine, "--wire-image": winterWire } as CSSProperties}>
          {id === "autumn" && <span className="season-vine" aria-hidden="true" />}
          {id === "bluebonnets" && <span className="season-vine season-vine--spring" aria-hidden="true" />}
          {id === "winter" && (
            <span className="season-lights" aria-hidden="true">
              {bulbs.map((b, i) => (
                <span key={i} className="season-bulb" style={{ left: `${b.left}%`, top: `${b.top}px`, "--bulb": b.color, animationDelay: `${-b.delay}s` } as CSSProperties} />
              ))}
            </span>
          )}
        </button>
      )}
      {typeof document !== "undefined" && createPortal(<canvas ref={canvas} className="season-particles" aria-hidden="true" />, document.body)}
    </>
  )
}

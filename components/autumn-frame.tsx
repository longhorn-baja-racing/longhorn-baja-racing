"use client"

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""
type Leaf = { id: number; x: number; drift: number; delay: number; duration: number; size: number }

export default function AutumnFrame() {
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Set<number>())

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(timer => window.clearTimeout(timer))
  }, [])

  function shakeVine(event: MouseEvent<HTMLButtonElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.detail === 0 ? bounds.width / 2 : event.clientX - bounds.left
    const burst = Array.from({ length: 12 }, () => ({
      id: nextId.current++, x: Math.max(8, Math.min(bounds.width - 8, x + (Math.random() - .5) * 100)),
      drift: (Math.random() - .5) * 200, delay: Math.random() * .6,
      duration: 3.5 + Math.random() * 2, size: 16 + Math.random() * 12,
    }))
    setLeaves(previous => [...previous, ...burst].slice(-60))

    // animationend can arrive late or not at all (busy or background tabs), so
    // also remove the burst once its longest animation has finished.
    const ids = new Set(burst.map(leaf => leaf.id))
    const lifetime = Math.max(...burst.map(leaf => leaf.delay + leaf.duration)) * 1000 + 250
    const timer = window.setTimeout(() => {
      timers.current.delete(timer)
      setLeaves(previous => previous.filter(item => !ids.has(item.id)))
    }, lifetime)
    timers.current.add(timer)
  }

  return (
    <div className="autumn-frame" style={{ "--garland-image": `url("${base}/autumn/garland.webp")` } as CSSProperties}>
      <button type="button" className="autumn-garland autumn-garland--top autumn-vine-trigger" aria-label="Shake the autumn vine to release leaves" title="Click to shake down some leaves" onClick={shakeVine}>
        <span className="autumn-vine autumn-vine--front" aria-hidden="true" />
      </button>
      {Array.from({length: 7}, (_, i) => <span key={i} aria-hidden="true" className="autumn-drifting-leaf" style={{left: `${7 + i * 14}%`, animationDelay: `${-i * 1.8}s`, animationDuration: `${10 + i % 3}s`} as CSSProperties} />)}
      {leaves.map(leaf => <span key={leaf.id} aria-hidden="true" className="autumn-drifting-leaf autumn-burst-leaf" onAnimationEnd={() => setLeaves(previous => previous.filter(item => item.id !== leaf.id))} style={{ left: leaf.x, width: leaf.size, height: leaf.size * 1.35, "--leaf-drift": `${leaf.drift}px`, animationDelay: `${leaf.delay}s`, animationDuration: `${leaf.duration}s` } as CSSProperties} />)}
    </div>
  )
}

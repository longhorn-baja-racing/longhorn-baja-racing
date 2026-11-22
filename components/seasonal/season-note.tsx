"use client"

import { useSeason } from "./use-season"

/** Footer line naming the active seasonal treat and when it ends. */
export default function SeasonNote() {
  const active = useSeason()
  if (!active) return null
  const until = active.ends?.toLocaleDateString("en-US", { month: "long", day: "numeric" })
  const label = active.highlight && active.season.highlight ? active.season.highlight.name : `${active.season.name}${until ? ` until ${until}` : ""}`
  return (
    <p className="season-note" data-season-note={active.highlight ? "christmas" : active.season.id}>
      <span className="season-note-dot" aria-hidden="true" />
      {label}
    </p>
  )
}

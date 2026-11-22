"use client"

import { useSeason } from "./use-season"

/** Footer line naming the active seasonal treat and when it ends. */
export default function SeasonNote() {
  const season = useSeason()
  if (!season) return null
  const until = season.ends?.toLocaleDateString("en-US", { month: "long", day: "numeric" })
  return (
    <p className="season-note" data-season-note={season.season.id}>
      <span className="season-note-dot" aria-hidden="true" />
      {season.season.name}{until ? ` until ${until}` : ""}
    </p>
  )
}

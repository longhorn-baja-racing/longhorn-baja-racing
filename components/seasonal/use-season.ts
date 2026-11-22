"use client"

import { useEffect, useSyncExternalStore } from "react"
import { activeSeason, seasons, type ActiveSeason } from "@/lib/seasons"

export type { ActiveSeason }

let cached: ActiveSeason | null | undefined

/** `?season=` preview values: autumn, winter, christmas (winter plus Christmas week), off. */
function preview(param: string | null): ActiveSeason | null | undefined {
  if (param === "off") return null
  if (param === "autumn" || param === "winter" || param === "christmas") {
    const season = seasons.find((s) => s.id === (param === "christmas" ? "winter" : param))!
    return { season, ends: null, highlight: param === "christmas" }
  }
  return undefined
}

function read(): ActiveSeason | null {
  if (cached === undefined) {
    const forced = preview(new URLSearchParams(window.location.search).get("season"))
    cached = forced === undefined ? activeSeason(new Date()) : forced
  }
  return cached
}

const subscribe = () => () => {}

/**
 * The seasonal decoration for today, decided in the browser so the static site
 * switches on and off by itself (the server snapshot is always "none", so the
 * exported HTML is the same for every visitor).
 */
export function useSeason(): ActiveSeason | null {
  const active = useSyncExternalStore(subscribe, read, () => null)
  useEffect(() => {
    if (!active) return
    const root = document.documentElement
    root.dataset.season = active.highlight ? "christmas" : active.season.id
    return () => { delete root.dataset.season }
  }, [active])
  return active
}

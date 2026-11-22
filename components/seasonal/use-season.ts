"use client"

import { useEffect, useSyncExternalStore } from "react"
import { activeSeason, isSeasonId, seasons, type Season } from "@/lib/seasons"

export type ActiveSeason = { season: Season; ends: Date | null }

let cached: ActiveSeason | null | undefined

function read(): ActiveSeason | null {
  if (cached === undefined) {
    const param = new URLSearchParams(window.location.search).get("season")
    if (param === "off") cached = null
    else if (isSeasonId(param)) cached = { season: seasons.find((s) => s.id === param)!, ends: null }
    else cached = activeSeason(new Date())
  }
  return cached
}

const subscribe = () => () => {}

/**
 * The seasonal decoration for today, decided in the browser so the static site
 * switches on and off by itself (the server snapshot is always "none", so the
 * exported HTML is the same for every visitor). `?season=<id>` previews one;
 * `?season=off` hides it.
 */
export function useSeason(): ActiveSeason | null {
  const active = useSyncExternalStore(subscribe, read, () => null)
  useEffect(() => {
    if (!active) return
    document.documentElement.dataset.season = active.season.id
    return () => { delete document.documentElement.dataset.season }
  }, [active])
  return active
}

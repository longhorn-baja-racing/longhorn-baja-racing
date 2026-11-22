// Seasonal decorations are a small treat, not a theme: each one switches on by
// itself for a short window every year and must never run longer than a month.
// Dates are inclusive and use the visitor's local calendar. A window may wrap
// into the next year (winter does). `npm run test:hub` checks every window.

export const MAX_SEASON_DAYS = 31

export const seasonIds = ["bluebonnets", "fireflies", "autumn", "winter"] as const
export type SeasonId = (typeof seasonIds)[number]

export type Season = {
  id: SeasonId
  /** Short name shown in the footer while the season is active. */
  name: string
  /** [month 1-12, day] */
  start: readonly [number, number]
  end: readonly [number, number]
}

export const seasons: readonly Season[] = [
  { id: "bluebonnets", name: "Bluebonnet season", start: [3, 22], end: [4, 18] },
  { id: "fireflies", name: "Summer fireflies", start: [6, 1], end: [6, 30] },
  { id: "autumn", name: "Fall leaves", start: [11, 1], end: [11, 30] },
  { id: "winter", name: "Winter lights", start: [12, 12], end: [1, 6] },
]

const DAY = 24 * 60 * 60 * 1000
const utc = (year: number, [month, day]: readonly [number, number]) => Date.UTC(year, month - 1, day)
const wraps = (season: Season) => utc(2001, season.end) < utc(2001, season.start)

/** Length of the window in days (inclusive) when it starts in `year`. */
export function seasonDays(season: Season, year: number) {
  const end = utc(wraps(season) ? year + 1 : year, season.end)
  return Math.round((end - utc(year, season.start)) / DAY) + 1
}

/** The active season on `date`, if any, with the local date it ends on. */
export function activeSeason(date: Date): { season: Season; ends: Date } | null {
  const year = date.getFullYear()
  const today = Date.UTC(year, date.getMonth(), date.getDate())
  for (const season of seasons) {
    const candidates = wraps(season) ? [year - 1, year] : [year]
    for (const startYear of candidates) {
      const start = utc(startYear, season.start)
      const endYear = wraps(season) ? startYear + 1 : startYear
      const end = utc(endYear, season.end)
      if (today >= start && today <= end) {
        return { season, ends: new Date(endYear, season.end[0] - 1, season.end[1]) }
      }
    }
  }
  return null
}

export function isSeasonId(value: unknown): value is SeasonId {
  return typeof value === "string" && (seasonIds as readonly string[]).includes(value)
}

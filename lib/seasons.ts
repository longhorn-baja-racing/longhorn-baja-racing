// Seasonal decorations are a small treat, not a theme. Each one switches on by
// itself for one window a year and never runs longer than a month; every
// other day the site is plain. Dates are inclusive and use the visitor's local
// calendar. `npm run test:hub` checks every window.

export const MAX_SEASON_DAYS = 31

export const seasonIds = ["autumn", "winter"] as const
export type SeasonId = (typeof seasonIds)[number]

type MonthDay = readonly [number, number]

export type Season = {
  id: SeasonId
  /** Short name shown in the footer while the season is active. */
  name: string
  start: MonthDay
  end: MonthDay
  /** A shorter window inside the season with extra touches (Christmas week). */
  highlight?: { name: string; start: MonthDay; end: MonthDay }
}

export const seasons: readonly Season[] = [
  { id: "autumn", name: "Fall leaves", start: [10, 1], end: [10, 31] },
  {
    id: "winter",
    name: "December snow",
    start: [12, 1],
    end: [12, 31],
    highlight: { name: "Merry Christmas", start: [12, 18], end: [12, 25] },
  },
]

const DAY = 24 * 60 * 60 * 1000
const utc = (year: number, [month, day]: MonthDay) => Date.UTC(year, month - 1, day)

/** Length of a window in days (inclusive). Windows never cross a new year. */
export function windowDays(window: { start: MonthDay; end: MonthDay }, year: number) {
  return Math.round((utc(year, window.end) - utc(year, window.start)) / DAY) + 1
}

const inWindow = (date: Date, window: { start: MonthDay; end: MonthDay }) => {
  const year = date.getFullYear()
  const today = Date.UTC(year, date.getMonth(), date.getDate())
  return today >= utc(year, window.start) && today <= utc(year, window.end)
}

export type ActiveSeason = { season: Season; ends: Date | null; highlight: boolean }

/** The active season on `date`, if any, with the date it ends and whether its highlight is on. */
export function activeSeason(date: Date): ActiveSeason | null {
  for (const season of seasons) {
    if (!inWindow(date, season)) continue
    return {
      season,
      ends: new Date(date.getFullYear(), season.end[0] - 1, season.end[1]),
      highlight: !!season.highlight && inWindow(date, season.highlight),
    }
  }
  return null
}

export function isSeasonId(value: unknown): value is SeasonId {
  return typeof value === "string" && (seasonIds as readonly string[]).includes(value)
}

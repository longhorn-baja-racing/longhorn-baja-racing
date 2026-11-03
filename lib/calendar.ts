// Team calendar data. scripts/fetch-calendar.ts downloads the public Google
// Calendar feed at build time and writes public/data/calendar.json; the
// browser reads that file. No Google API key or sign-in is involved.

export const CALENDAR_TIME_ZONE = "America/Chicago"
export const CALENDAR_ID = "longhornbaja@gmail.com"
export const CALENDAR_ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`
export const CALENDAR_DATA_PATH = "/data/calendar.json"

export type CalendarEvent = {
  /** Unique per occurrence. */
  id: string
  title: string
  allDay: boolean
  /** Timed: ISO 8601 UTC. All-day: YYYY-MM-DD. */
  start: string
  /** Timed: ISO 8601 UTC. All-day: YYYY-MM-DD, exclusive. */
  end: string
  location?: string
  /** Plain text only, already stripped of HTML and shortened. */
  description?: string
}

export type CalendarFeed = {
  status: "ok" | "unavailable"
  generatedAt: string
  timeZone: string
  events: CalendarEvent[]
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function validEvent(value: unknown): CalendarEvent | null {
  if (typeof value !== "object" || value === null) return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== "string" || typeof item.title !== "string" || typeof item.allDay !== "boolean") return null
  if (typeof item.start !== "string" || typeof item.end !== "string") return null
  const isDate = (text: string) => (item.allDay ? datePattern.test(text) : !Number.isNaN(Date.parse(text)))
  if (!isDate(item.start) || !isDate(item.end)) return null
  const event: CalendarEvent = { id: item.id, title: item.title.trim() || "Untitled event", allDay: item.allDay, start: item.start, end: item.end }
  if (typeof item.location === "string" && item.location.trim()) event.location = item.location.trim()
  if (typeof item.description === "string" && item.description.trim()) event.description = item.description.trim()
  return event
}

/** Validates feed JSON. Malformed events are dropped instead of failing the whole feed. */
export function parseCalendarFeed(value: unknown): CalendarFeed {
  if (typeof value !== "object" || value === null) throw new Error("Calendar data is not an object")
  const feed = value as Record<string, unknown>
  if (feed.status !== "ok" && feed.status !== "unavailable") throw new Error("Calendar data has no status")
  const events = Array.isArray(feed.events) ? feed.events.map(validEvent).filter((event): event is CalendarEvent => event !== null) : []
  return {
    status: feed.status,
    generatedAt: typeof feed.generatedAt === "string" ? feed.generatedAt : "",
    timeZone: typeof feed.timeZone === "string" ? feed.timeZone : CALENDAR_TIME_ZONE,
    events,
  }
}

let pending: Promise<CalendarFeed> | null = null

/** Fetches the feed once per page session and shares it between components. */
export function loadCalendarFeed(): Promise<CalendarFeed> {
  if (!pending) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ""
    pending = fetch(`${base}${CALENDAR_DATA_PATH}`, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Calendar data request failed: ${response.status}`)
        return response.json()
      })
      .then(parseCalendarFeed)
      .catch((error: unknown) => {
        pending = null
        throw error
      })
  }
  return pending
}

/** Today's date in team time as YYYY-MM-DD. */
function teamDate(now: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CALENDAR_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now)
}

/** Sort key: all-day events sort at the start of their day (midnight UTC is close enough for ordering). */
function startTime(event: CalendarEvent): number {
  return event.allDay ? Date.parse(`${event.start}T00:00:00Z`) : Date.parse(event.start)
}

/** Events that have not ended yet, soonest first. All-day events last through their final day in team time. */
export function upcomingEvents(events: readonly CalendarEvent[], now = Date.now()): CalendarEvent[] {
  const today = teamDate(now)
  return events
    .filter((event) => (event.allDay ? event.end > today : Date.parse(event.end) > now))
    .sort((a, b) => startTime(a) - startTime(b))
}

// All-day dates are calendar dates, so format them in UTC to avoid shifting a day.
function dateOnly(text: string): Date {
  return new Date(`${text}T12:00:00Z`)
}

function formatter(options: Intl.DateTimeFormatOptions, allDay: boolean) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: allDay ? "UTC" : CALENDAR_TIME_ZONE })
}

export type EventDisplay = {
  /** For the date block, for example "NOV" and "22". */
  month: string
  day: string
  weekday: string
  /** Full date line, for example "Sunday, November 22" or "Nov 22 - Nov 24". */
  dateLabel: string
  /** "All day" or "6:00 PM - 8:00 PM CST". */
  timeLabel: string
  /** Machine-readable start for the <time> element. */
  dateTime: string
  /** Month heading used to group the full list, for example "November 2026". */
  monthKey: string
}

export function describeEvent(event: CalendarEvent): EventDisplay {
  const start = event.allDay ? dateOnly(event.start) : new Date(event.start)
  const allDay = event.allDay
  const month = formatter({ month: "short" }, allDay).format(start).toUpperCase()
  const day = formatter({ day: "numeric" }, allDay).format(start)
  const weekday = formatter({ weekday: "short" }, allDay).format(start)
  const monthKey = formatter({ month: "long", year: "numeric" }, allDay).format(start)
  const longDate = formatter({ weekday: "long", month: "long", day: "numeric" }, allDay)
  const shortDate = formatter({ month: "short", day: "numeric" }, allDay)

  if (allDay) {
    // The end date is exclusive: an event on Nov 22 only ends on Nov 23.
    const lastDay = new Date(dateOnly(event.end).getTime() - 86_400_000)
    const multiDay = lastDay.getTime() > start.getTime()
    return {
      month, day, weekday, monthKey,
      dateLabel: multiDay ? `${shortDate.format(start)} - ${shortDate.format(lastDay)}` : longDate.format(start),
      timeLabel: "All day",
      dateTime: event.start,
    }
  }

  const end = new Date(event.end)
  const time = formatter({ hour: "numeric", minute: "2-digit" }, false)
  const zone = formatter({ timeZoneName: "short" }, false).formatToParts(start).find((part) => part.type === "timeZoneName")?.value ?? ""
  const sameDay = shortDate.format(start) === shortDate.format(end)
  return {
    month, day, weekday, monthKey,
    dateLabel: sameDay ? longDate.format(start) : `${shortDate.format(start)} - ${shortDate.format(end)}`,
    timeLabel: sameDay
      ? `${time.format(start)} - ${time.format(end)} ${zone}`.trim()
      : `${shortDate.format(start)}, ${time.format(start)} - ${shortDate.format(end)}, ${time.format(end)} ${zone}`.trim(),
    dateTime: event.start,
  }
}

function compactUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

/** Link that opens Google Calendar with this event pre-filled, so visitors can save it. */
export function addToGoogleCalendarUrl(event: CalendarEvent): string {
  const dates = event.allDay
    ? `${event.start.replace(/-/g, "")}/${event.end.replace(/-/g, "")}`
    : `${compactUtc(event.start)}/${compactUtc(event.end)}`
  const params = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates, ctz: CALENDAR_TIME_ZONE })
  if (event.location) params.set("location", event.location)
  if (event.description) params.set("details", event.description)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

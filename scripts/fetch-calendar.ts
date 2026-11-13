// Downloads the team's public Google Calendar feed and writes the upcoming
// occurrences to public/data/calendar.json for the static site.
//
//   node scripts/fetch-calendar.ts                  # runs automatically before npm run build
//   CALENDAR_ICS_FILE=path/to/feed.ics node scripts/fetch-calendar.ts   # offline input
//
// A network or parse failure writes { status: "unavailable" } and exits 0, so a
// Google outage never breaks the build; the page then links to Google Calendar.
// With CALENDAR_REQUIRED=true (set for the daily scheduled deploy) it exits 1
// instead, so a failed fetch does not replace the live site's good data.

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import ICAL from "ical.js"
import { CALENDAR_DATA_PATH, CALENDAR_ICS_URL, CALENDAR_TIME_ZONE, compareEvents, type CalendarEvent, type CalendarFeed } from "../lib/calendar.ts"

const OUT = `public${CALENDAR_DATA_PATH}`
const LOOKBACK_MS = 2 * 86_400_000
const LOOKAHEAD_MS = 180 * 86_400_000
const MAX_EVENTS = 200
const MAX_DESCRIPTION = 280

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" }

/** Google descriptions are HTML. Keep plain text only, then shorten. */
export function plainText(html: string, max = MAX_DESCRIPTION): string {
  const text = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, name: string) => {
      const key = name.toLowerCase()
      if (key.startsWith("#x")) return String.fromCodePoint(parseInt(key.slice(2), 16))
      if (key.startsWith("#") && key !== "#39") return String.fromCodePoint(parseInt(key.slice(1), 10))
      return entities[key] ?? match
    })
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`
}

function toOutputTime(time: ICAL.Time): string {
  return time.isDate ? time.toString().slice(0, 10) : time.toJSDate().toISOString()
}

function textProperty(event: ICAL.Event, name: string): string | undefined {
  const value = event.component.getFirstPropertyValue(name)
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function isCancelled(event: ICAL.Event): boolean {
  return String(event.component.getFirstPropertyValue("status") ?? "").toUpperCase() === "CANCELLED"
}

function toCalendarEvent(item: ICAL.Event, start: ICAL.Time, end: ICAL.Time): CalendarEvent {
  const event: CalendarEvent = {
    id: `${item.uid}@${toOutputTime(start)}`,
    title: (item.summary || "").trim() || "Untitled event",
    allDay: start.isDate,
    start: toOutputTime(start),
    end: toOutputTime(end),
  }
  const location = textProperty(item, "location")
  if (location) event.location = location
  const description = textProperty(item, "description")
  if (description) {
    const text = plainText(description)
    if (text) event.description = text
  }
  return event
}

/** Expands recurring events and returns occurrences that overlap [from, to). */
export function eventsFromIcs(ics: string, from: Date, to: Date): CalendarEvent[] {
  const root = new ICAL.Component(ICAL.parse(ics))
  for (const zone of root.getAllSubcomponents("vtimezone")) ICAL.TimezoneService.register(zone)

  const vevents = root.getAllSubcomponents("vevent")
  const masters = new Map<string, ICAL.Event>()
  const exceptions: ICAL.Event[] = []
  for (const component of vevents) {
    const event = new ICAL.Event(component)
    if (event.isRecurrenceException()) exceptions.push(event)
    else masters.set(event.uid, event)
  }
  for (const exception of exceptions) {
    const master = masters.get(exception.uid)
    if (master) master.relateException(exception)
  }

  const fromTime = ICAL.Time.fromJSDate(from, true)
  const toTime = ICAL.Time.fromJSDate(to, true)
  const overlaps = (start: ICAL.Time, end: ICAL.Time) => {
    const startMs = start.isDate ? Date.parse(toOutputTime(start)) : start.toJSDate().getTime()
    const endMs = end.isDate ? Date.parse(toOutputTime(end)) : end.toJSDate().getTime()
    return endMs > from.getTime() && startMs < to.getTime()
  }

  const results: CalendarEvent[] = []
  for (const master of masters.values()) {
    if (isCancelled(master) || !master.startDate) continue
    if (!master.isRecurring()) {
      const end = master.endDate ?? master.startDate
      if (overlaps(master.startDate, end)) results.push(toCalendarEvent(master, master.startDate, end))
      continue
    }
    const iterator = master.iterator()
    for (let next = iterator.next(), guard = 0; next && guard < 5000; next = iterator.next(), guard++) {
      if (next.compare(toTime) >= 0) break
      const details = master.getOccurrenceDetails(next)
      if (details.endDate.compare(fromTime) <= 0 && !details.endDate.isDate) continue
      if (isCancelled(details.item)) continue
      if (overlaps(details.startDate, details.endDate)) results.push(toCalendarEvent(details.item, details.startDate, details.endDate))
    }
  }

  // Exceptions moved into the window from a master that does not exist in the feed.
  for (const exception of exceptions) {
    if (masters.has(exception.uid) || isCancelled(exception) || !exception.startDate) continue
    const end = exception.endDate ?? exception.startDate
    if (overlaps(exception.startDate, end)) results.push(toCalendarEvent(exception, exception.startDate, end))
  }

  return results.sort(compareEvents).slice(0, MAX_EVENTS)
}

async function readFeed(): Promise<string> {
  const file = process.env.CALENDAR_ICS_FILE
  if (file) return readFile(file, "utf8")
  const response = await fetch(CALENDAR_ICS_URL, { signal: AbortSignal.timeout(20_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

async function main() {
  const now = Date.now()
  let feed: CalendarFeed
  try {
    const events = eventsFromIcs(await readFeed(), new Date(now - LOOKBACK_MS), new Date(now + LOOKAHEAD_MS))
    feed = { status: "ok", generatedAt: new Date(now).toISOString(), timeZone: CALENDAR_TIME_ZONE, events }
    console.log(`Calendar: wrote ${events.length} events to ${OUT}.`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    if (process.env.CALENDAR_REQUIRED === "true") {
      console.error(`Calendar: feed unavailable (${reason}). CALENDAR_REQUIRED is set, so the build stops and the deployed calendar stays as it is.`)
      process.exit(1)
    }
    feed = { status: "unavailable", generatedAt: new Date(now).toISOString(), timeZone: CALENDAR_TIME_ZONE, events: [] }
    console.warn(`Calendar: feed unavailable (${reason}). Wrote an empty feed to ${OUT}.`)
  }
  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(feed) + "\n")
}

if (import.meta.url === `file://${process.argv[1]}`) await main()

// Schema.org Event structured data for the calendar page. app/calendar/page.tsx
// builds it at export time from public/data/calendar.json, so crawlers see the
// events in the static HTML without running any scripts.
// https://developers.google.com/search/docs/appearance/structured-data/event

import { CALENDAR_TIME_ZONE, isFeedStale, upcomingEvents, type CalendarEvent, type CalendarFeed } from "./calendar.ts"
import { siteConfig } from "./site.ts"

export const MAX_JSON_LD_EVENTS = 20

/** Titles that carry no event information, such as free/busy blocks. */
const placeholderTitles = new Set(["untitled event", "busy", "private", "private event"])

type Place = { "@type": "Place"; name: string; address: string }
type VirtualLocation = { "@type": "VirtualLocation"; url: string }

export type EventJsonLd = {
  "@context": "https://schema.org"
  "@type": "Event"
  name: string
  startDate: string
  endDate: string
  eventStatus: "https://schema.org/EventScheduled"
  eventAttendanceMode?: "https://schema.org/OfflineEventAttendanceMode" | "https://schema.org/OnlineEventAttendanceMode"
  location?: Place | VirtualLocation
  description?: string
  url: string
  organizer: { "@type": "Organization"; "@id": string; name: string; url: string }
}

const teamTime = new Intl.DateTimeFormat("en-US", {
  timeZone: CALENDAR_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZoneName: "longOffset",
})

/** A UTC instant as local team time with its offset, for example "2026-11-22T18:00:00-06:00". */
export function teamDateTime(iso: string): string {
  const parts = Object.fromEntries(teamTime.formatToParts(new Date(iso)).map((part) => [part.type, part.value]))
  const offset = parts.timeZoneName === "GMT" ? "+00:00" : parts.timeZoneName.replace("GMT", "")
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`
}

/** The last day of an all-day event. Feed end dates are exclusive. */
function lastDay(event: CalendarEvent): string {
  const last = new Date(Date.parse(`${event.end}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10)
  return last > event.start ? last : event.start
}

function location(text: string): Pick<EventJsonLd, "location" | "eventAttendanceMode"> {
  if (/^https?:\/\/\S+$/i.test(text)) {
    return { location: { "@type": "VirtualLocation", url: text }, eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode" }
  }
  // Google Calendar locations are free text, often "Venue, street, city". The
  // first part names the place; the whole text is its address.
  const name = text.split(",")[0].trim() || text
  return { location: { "@type": "Place", name, address: text }, eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode" }
}

/**
 * One calendar occurrence as a schema.org Event. Only fields present in the
 * feed are emitted: no location is assumed when the event has none. Cancelled
 * occurrences never reach the feed, so every event here is scheduled.
 */
export function eventJsonLd(event: CalendarEvent): EventJsonLd {
  const item: EventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.allDay ? event.start : teamDateTime(event.start),
    endDate: event.allDay ? lastDay(event) : teamDateTime(event.end),
    eventStatus: "https://schema.org/EventScheduled",
    url: `${siteConfig.url}/calendar/`,
    organizer: { "@type": "Organization", "@id": `${siteConfig.url}/#organization`, name: siteConfig.name, url: siteConfig.url },
  }
  if (event.location) Object.assign(item, location(event.location))
  if (event.description) item.description = event.description
  return item
}

export function isPublicEvent(event: CalendarEvent): boolean {
  const title = event.title.trim()
  return title !== "" && !placeholderTitles.has(title.toLowerCase())
}

/**
 * Event structured data for the next upcoming events, or null when there is
 * nothing trustworthy to publish: no feed file, a feed that was unavailable at
 * build time, stale data, or no upcoming public events.
 */
export function calendarEventsJsonLd(feed: CalendarFeed | null, now = Date.now(), limit = MAX_JSON_LD_EVENTS): EventJsonLd[] | null {
  if (!feed || feed.status !== "ok" || isFeedStale(feed, now)) return null
  const events = upcomingEvents(feed.events, now).filter(isPublicEvent).slice(0, limit)
  return events.length > 0 ? events.map(eventJsonLd) : null
}

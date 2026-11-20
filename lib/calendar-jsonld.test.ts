// Tests for the calendar page's Event structured data. Run with npm run test:calendar.

import assert from "node:assert/strict"
import { test } from "node:test"
import type { CalendarEvent, CalendarFeed } from "./calendar.ts"
import { calendarEventsJsonLd, eventJsonLd, MAX_JSON_LD_EVENTS, teamDateTime } from "./calendar-jsonld.ts"
import { serializeJsonLd } from "./json-ld.ts"

const NOW = Date.parse("2026-11-20T12:00:00Z")

function feed(events: CalendarEvent[], extra: Partial<CalendarFeed> = {}): CalendarFeed {
  return { status: "ok", generatedAt: "2026-11-20T10:00:00.000Z", timeZone: "America/Chicago", events, ...extra }
}

const meeting: CalendarEvent = {
  id: "meeting@2026-11-23",
  title: "General meeting",
  allDay: false,
  start: "2026-11-24T00:30:00.000Z",
  end: "2026-11-24T01:30:00.000Z",
  location: "ETC 2.136, 204 E Dean Keeton St, Austin, TX 78712, USA",
  description: "Bring a laptop.",
}

test("timed events use Austin time with the offset in effect on that date", () => {
  assert.equal(teamDateTime("2026-11-24T00:30:00.000Z"), "2026-11-23T18:30:00-06:00")
  assert.equal(teamDateTime("2026-07-04T15:00:00.000Z"), "2026-07-04T10:00:00-05:00")
})

test("a timed event with a location becomes a scheduled, in-person Event", () => {
  assert.deepEqual(eventJsonLd(meeting), {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "General meeting",
    startDate: "2026-11-23T18:30:00-06:00",
    endDate: "2026-11-23T19:30:00-06:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: "ETC 2.136", address: "ETC 2.136, 204 E Dean Keeton St, Austin, TX 78712, USA" },
    description: "Bring a laptop.",
    url: "https://longhornbajaracing.com/calendar/",
    organizer: {
      "@type": "Organization",
      "@id": "https://longhornbajaracing.com/#organization",
      name: "Longhorn Baja Racing",
      url: "https://longhornbajaracing.com",
    },
  })
})

test("all-day events use dates, with the inclusive last day as the end", () => {
  const trip = eventJsonLd({ id: "trip", title: "Competition", allDay: true, start: "2026-12-04", end: "2026-12-07" })
  assert.equal(trip.startDate, "2026-12-04")
  assert.equal(trip.endDate, "2026-12-06")
  const single = eventJsonLd({ id: "day", title: "Shop day", allDay: true, start: "2026-12-04", end: "2026-12-05" })
  assert.equal(single.endDate, "2026-12-04")
})

test("events without a location or description do not get invented ones", () => {
  const item = eventJsonLd({ id: "x", title: "Design review", allDay: false, start: meeting.start, end: meeting.end })
  assert.equal("location" in item, false)
  assert.equal("eventAttendanceMode" in item, false)
  assert.equal("description" in item, false)
  assert.equal("image" in item, false)
  assert.equal("offers" in item, false)
})

test("a link as the location is an online event", () => {
  const item = eventJsonLd({ ...meeting, location: "https://utexas.zoom.us/j/123" })
  assert.deepEqual(item.location, { "@type": "VirtualLocation", url: "https://utexas.zoom.us/j/123" })
  assert.equal(item.eventAttendanceMode, "https://schema.org/OnlineEventAttendanceMode")
})

test("lists only upcoming public events, soonest first, up to the limit", () => {
  const past = { ...meeting, id: "past", title: "Past meeting", start: "2026-11-19T00:00:00.000Z", end: "2026-11-19T01:00:00.000Z" }
  const untitled = { ...meeting, id: "untitled", title: "Untitled event" }
  const busy = { ...meeting, id: "busy", title: "Busy" }
  const later = { ...meeting, id: "later", title: "Later meeting", start: "2026-12-01T00:30:00.000Z", end: "2026-12-01T01:30:00.000Z" }
  const items = calendarEventsJsonLd(feed([later, past, untitled, meeting, busy]), NOW)
  assert.deepEqual(items?.map((item) => item.name), ["General meeting", "Later meeting"])

  const many = Array.from({ length: 30 }, (_, index) => ({ ...meeting, id: `m${index}`, title: `Meeting ${index}` }))
  assert.equal(calendarEventsJsonLd(feed(many), NOW)?.length, MAX_JSON_LD_EVENTS)
})

test("no structured data when the feed is missing, unavailable, stale, or empty", () => {
  assert.equal(calendarEventsJsonLd(null, NOW), null)
  assert.equal(calendarEventsJsonLd(feed([meeting], { status: "unavailable" }), NOW), null)
  assert.equal(calendarEventsJsonLd(feed([meeting], { generatedAt: "2026-11-01T00:00:00.000Z" }), NOW), null)
  assert.equal(calendarEventsJsonLd(feed([meeting], { generatedAt: "" }), NOW), null)
  assert.equal(calendarEventsJsonLd(feed([]), NOW), null)
})

test("a malicious title cannot close the script tag", () => {
  const title = "</script><script>alert(1)</script><!-- x"
  const html = serializeJsonLd(calendarEventsJsonLd(feed([{ ...meeting, title, description: "<b>hi</b>" }]), NOW))
  assert.equal(html.includes("<"), false)
  assert.equal(/<\/script/i.test(html), false)
  assert.ok(html.includes("\\u003c/script>"))
  const [parsed] = JSON.parse(html)
  assert.equal(parsed.name, title)
  assert.equal(parsed.description, "<b>hi</b>")
})

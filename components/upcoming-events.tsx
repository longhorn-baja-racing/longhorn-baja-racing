"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { addToGoogleCalendarUrl, describeEvent, loadCalendarFeed, upcomingEvents, type CalendarEvent } from "@/lib/calendar"
import { siteConfig } from "@/lib/site"

type State = { kind: "loading" } | { kind: "error" } | { kind: "ready"; events: CalendarEvent[] }

interface UpcomingEventsProps {
  /** Maximum number of events to show. */
  limit?: number
  /** Group the list under month headings (full calendar page). */
  groupByMonth?: boolean
  /** Show a "View full calendar" link under the list (homepage preview). */
  showCalendarLink?: boolean
}

export default function UpcomingEvents({ limit = 5, groupByMonth = false, showCalendarLink = false }: UpcomingEventsProps) {
  const [state, setState] = useState<State>({ kind: "loading" })

  useEffect(() => {
    let active = true
    loadCalendarFeed()
      .then((feed) => {
        if (!active) return
        if (feed.status !== "ok") setState({ kind: "error" })
        else setState({ kind: "ready", events: upcomingEvents(feed.events).slice(0, limit) })
      })
      .catch(() => active && setState({ kind: "error" }))
    return () => {
      active = false
    }
  }, [limit])

  const googleLink = (
    <a href={siteConfig.calendarUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
      open the team calendar in Google Calendar
    </a>
  )

  if (state.kind === "loading") {
    return (
      <div aria-busy="true" aria-live="polite" className="space-y-3">
        <span className="sr-only">Loading upcoming events</span>
        {Array.from({ length: Math.min(limit, 3) }, (_, index) => (
          <div key={index} className="event-card h-28 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (state.kind === "error") {
    return (
      <p role="status" className="event-card p-6 leading-7 text-white/70">
        Upcoming events could not be loaded right now. You can {googleLink} instead.
      </p>
    )
  }

  if (state.events.length === 0) {
    return (
      <p role="status" className="event-card p-6 leading-7 text-white/70">
        No upcoming events are scheduled right now. Check back soon, or {googleLink}.
      </p>
    )
  }

  const groups: { month: string; events: CalendarEvent[] }[] = []
  for (const event of state.events) {
    const month = groupByMonth ? describeEvent(event).monthKey : ""
    const last = groups[groups.length - 1]
    if (last && last.month === month) last.events.push(event)
    else groups.push({ month, events: [event] })
  }

  return (
    <div>
      {groups.map((group) => (
        <section key={group.month || "events"} aria-label={group.month || "Upcoming events"} className={groupByMonth ? "mb-10" : undefined}>
          {group.month && <h2 className="mb-4 text-3xl text-white">{group.month}</h2>}
          <ol className="space-y-3">
            {group.events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </ol>
        </section>
      ))}
      {showCalendarLink && (
        <Link href="/calendar/" prefetch={false} className="mt-6 inline-block text-sm text-white/75 underline decoration-primary underline-offset-8 hover:text-white">
          View full calendar
        </Link>
      )}
    </div>
  )
}

function EventItem({ event }: { event: CalendarEvent }) {
  const display = describeEvent(event)
  return (
    <li className="event-card flex gap-5 p-5 sm:gap-6">
      <time dateTime={display.dateTime} className="event-date" aria-hidden="true">
        <span className="font-mono text-[10px] tracking-[0.2em] text-primary-text">{display.month}</span>
        <span className="text-4xl leading-none text-white">{display.day}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">{display.weekday}</span>
      </time>
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl leading-tight text-white">{event.title}</h3>
        <p className="mt-2 text-sm text-white/80">
          <span className="sr-only">Date: </span>
          {display.dateLabel}
          <span aria-hidden="true" className="mx-2 text-white/35">|</span>
          <span className="sr-only">, time: </span>
          <span className="font-semibold text-primary-text">{display.timeLabel}</span>
        </p>
        {event.location && (
          <p className="mt-1 text-sm text-white/65">
            <span className="sr-only">Location: </span>
            {event.location}
          </p>
        )}
        {event.description && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/60">{event.description}</p>}
        <a
          href={addToGoogleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-semibold text-white/75 underline underline-offset-4 hover:text-white"
          aria-label={`Add ${event.title} on ${display.dateLabel} to Google Calendar (opens in a new tab)`}
        >
          Add to Google Calendar
        </a>
      </div>
    </li>
  )
}

import type { Metadata } from "next"
import Section from "@/components/section"
import UpcomingEvents from "@/components/upcoming-events"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Calendar",
  description: "Upcoming Longhorn Baja Racing meetings, shop sessions, and team events.",
  alternates: { canonical: "/calendar/" },
  openGraph: { url: "/calendar/" },
}

export default function CalendarPage() {
  return (
    <Section title="Team calendar" label="WHAT’S NEXT">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <p className="max-w-xl leading-7 text-white/70">Keep up with team meetings, shop sessions, and upcoming events. All times are shown in Austin time.</p>
        <a href={siteConfig.calendarUrl} target="_blank" rel="noopener noreferrer" className="action-link shrink-0">Open / add in Google Calendar ↗</a>
      </div>
      <UpcomingEvents limit={40} groupByMonth />
      <p className="mt-5 text-sm leading-7 text-white/60">Events come from the team&apos;s public Google Calendar and refresh daily. Use &quot;Add to Google Calendar&quot; to save an event, or subscribe to the whole calendar with the button above.</p>
    </Section>
  )
}

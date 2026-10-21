import type { Metadata } from "next"
import Section from "@/components/section"
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
      <div className="calendar-frame">
        <iframe
          title="Longhorn Baja Racing team events"
          src="https://calendar.google.com/calendar/embed?src=longhornbaja%40gmail.com&ctz=America%2FChicago&mode=AGENDA&showTitle=0&showPrint=0&showCalendars=0&showTz=1"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-[620px] w-full border-0 md:h-[720px]"
        />
      </div>
      <p className="mt-5 text-sm leading-7 text-white/60">If the calendar doesn’t appear, <a href={siteConfig.calendarUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">open it directly in Google Calendar</a>. Event visibility follows the team calendar’s sharing settings.</p>
    </Section>
  )
}

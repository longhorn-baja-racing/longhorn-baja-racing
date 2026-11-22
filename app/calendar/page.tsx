import type { Metadata } from "next"
import PageShell from "@/components/site/page-shell"
import { siteConfig } from "@/lib/site"
import Arrow from "@/components/site/arrow"

export const metadata: Metadata = {
  title: "Calendar",
  description: "Upcoming Longhorn Baja Racing meetings, shop sessions, and team events.",
  alternates: { canonical: "/calendar/" },
  openGraph: { url: "/calendar/" },
}

export default function CalendarPage() {
  return (
    <PageShell
      index="06"
      label="What's next"
      title="Team calendar"
      lede="Keep up with team meetings, shop sessions, and upcoming events. All times are shown in Austin time."
      action={<a href={siteConfig.calendarUrl} target="_blank" rel="noopener noreferrer" className="button button--primary">Open / add in Google Calendar <Arrow /></a>}
    >
      <div className="calendar-panel calendar-panel--page">
        <iframe
          title="Longhorn Baja Racing team events"
          src={siteConfig.calendarEmbedUrl}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="calendar-frame"
        />
      </div>
      <p className="page-note">
        If the calendar doesn&apos;t appear, <a href={siteConfig.calendarUrl} target="_blank" rel="noopener noreferrer">open it directly in Google Calendar</a>. Event visibility follows the team calendar&apos;s sharing settings.
      </p>
    </PageShell>
  )
}

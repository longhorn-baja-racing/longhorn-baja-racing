import Link from "next/link"
import SectionIntro from "@/components/site/section-intro"
import { siteConfig } from "@/lib/site"
import CalendarEmbed from "./calendar-embed"
import Arrow from "@/components/site/arrow"

export default function Calendar() {
  return (
    <section id="calendar" className="section" aria-labelledby="calendar-title">
      <div className="shell calendar-grid">
        <SectionIntro
          index="06"
          label="Calendar"
          id="calendar-title"
          title={<>What&apos;s next.</>}
          lede="Keep up with team meetings, shop sessions, and upcoming events. All times are shown in Austin time."
        >
          <div className="intro-actions">
            <Link className="button button--ghost" href="/calendar/">Full calendar page</Link>
            <a className="button button--primary" href={siteConfig.calendarUrl} target="_blank" rel="noopener noreferrer">Add in Google Calendar <Arrow /></a>
          </div>
        </SectionIntro>
        <CalendarEmbed />
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { siteConfig } from "@/lib/site"

/** The Google agenda loads only on request, so the home page stays fast and private. */
export default function CalendarEmbed() {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="calendar-panel">
      {loaded ? (
        <iframe title="Longhorn Baja Racing team events" src={siteConfig.calendarEmbedUrl} referrerPolicy="strict-origin-when-cross-origin" className="calendar-frame" />
      ) : (
        <div className="calendar-placeholder">
          <div className="calendar-ticks" aria-hidden="true">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <p>Meetings, shop sessions, and events, straight from the team calendar.</p>
          <button type="button" className="button button--primary" onClick={() => setLoaded(true)}>Show the agenda here</button>
          <p className="calendar-note">Loads Google Calendar.</p>
        </div>
      )}
    </div>
  )
}

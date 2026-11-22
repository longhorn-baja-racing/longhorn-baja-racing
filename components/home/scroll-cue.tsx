"use client"

import { scrollToSection } from "@/components/site/scroll"

/** "Press to scroll" control at the bottom of the hero. */
export default function ScrollCue({ target }: { target: string }) {
  return (
    <a href={`#${target}`} className="scroll-cue" onClick={(e) => { if (scrollToSection(target)) e.preventDefault() }}>
      <span className="scroll-cue-ring" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
      </span>
      <span className="scroll-cue-label">Explore the team</span>
    </a>
  )
}

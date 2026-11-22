import Link from "next/link"
import type { ReactNode } from "react"
import SectionIntro from "./section-intro"
import Arrow from "./arrow"

/** Standalone pages (merch catalog, calendar) share the home page's section look. */
export default function PageShell({ index, label, title, lede, action, children }: { index: string; label: string; title: string; lede: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="section section--page" aria-labelledby="page-title">
      <div className="shell">
        <Link href="/" className="back-link"><Arrow direction="left" /> Back to home</Link>
        <SectionIntro as="h1" index={index} label={label} id="page-title" title={title} lede={lede}>
          {action && <div className="intro-actions">{action}</div>}
        </SectionIntro>
        {children}
      </div>
    </section>
  )
}

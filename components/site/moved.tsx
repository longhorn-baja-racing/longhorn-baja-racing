import Link from "next/link"
import { asset } from "@/lib/site"

/**
 * Old standalone pages now live as sections of the home page. Static hosting
 * cannot send HTTP redirects, so these pages forward with a meta refresh
 * (plus a script for an instant jump) and keep a visible link as a fallback.
 */
export default function Moved({ section, label }: { section: string; label: string }) {
  const href = asset(`/#${section}`)
  return (
    <section className="section section--page moved" aria-labelledby="moved-title">
      <meta httpEquiv="refresh" content={`0; url=${href}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(href)})` }} />
      <div className="shell">
        <h1 id="moved-title" className="section-title">{label} has moved</h1>
        <p className="section-lede">Everything now lives on one page. <Link href={`/#${section}`}>Go to {label}</Link></p>
      </div>
    </section>
  )
}

export const movedMetadata = (title: string) => ({
  title,
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
})

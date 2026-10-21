import type { Metadata } from "next"
import Section from "@/components/section"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Join & Contact",
  description: "Join Longhorn Baja Racing at UT Austin or get in touch about sponsorships and partnerships.",
  alternates: { canonical: "/contact/" },
  openGraph: { url: "/contact/" },
}

export default function ContactPage() {
  return (
    <Section title="Build with us" label="JOIN / CONTACT">
      <p className="mb-10 max-w-2xl text-lg leading-8 text-white/75">From first ideas to the finish line, Longhorn Baja brings students together through hands-on engineering and off-road racing.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="industrial-card border border-white/15 p-7 md:p-10">
          <p className="eyebrow">For students</p>
          <h2 className="mt-5 text-4xl">Join the team</h2>
          <p className="my-6 leading-7 text-white/65">Interested in designing, building, testing, or supporting the vehicle? Tell us about yourself through the team application.</p>
          <a href={siteConfig.applyUrl} target="_blank" rel="noopener noreferrer" className="action-link">Apply to Longhorn Baja ↗</a>
        </article>
        <article className="industrial-card border border-white/15 p-7 md:p-10">
          <p className="eyebrow">Get in touch</p>
          <h2 className="mt-5 text-4xl">Let’s talk</h2>
          <p className="my-6 leading-7 text-white/65">Questions about the team, sponsorships, or working together? Reach out to Longhorn Baja Racing.</p>
          <a href={`mailto:${siteConfig.email}`} className="break-all text-sm font-semibold text-primary underline underline-offset-8">{siteConfig.email}</a>
          <a href={siteConfig.sponsorUrl} target="_blank" rel="noopener noreferrer" className="mt-7 block text-sm text-white/75 underline underline-offset-4">View sponsorship information ↗</a>
        </article>
      </div>
    </Section>
  )
}

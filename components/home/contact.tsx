import SectionIntro from "@/components/site/section-intro"
import { siteConfig } from "@/lib/site"
import Arrow from "@/components/site/arrow"

export default function Contact() {
  return (
    <section id="contact" className="section section--contact" aria-labelledby="contact-title">
      <div className="shell">
        <SectionIntro
          index="07"
          label="Join / Contact"
          id="contact-title"
          title="Build with us."
          lede="From first ideas to the finish line, Longhorn Baja brings students together through hands-on engineering and off-road racing."
        />
        <div className="contact-grid">
          <article className="contact-card contact-card--primary reveal">
            <p className="eyebrow eyebrow--plain">For students</p>
            <h3 className="contact-title">Join the team</h3>
            <p>Interested in designing, building, testing, or supporting the vehicle? Tell us about yourself through the team application.</p>
            <a className="button button--light" href={siteConfig.applyUrl} target="_blank" rel="noopener noreferrer">Apply to Longhorn Baja <Arrow /></a>
          </article>
          <article className="contact-card reveal">
            <p className="eyebrow eyebrow--plain">Get in touch</p>
            <h3 className="contact-title">Let&apos;s talk</h3>
            <p>Questions about the team, sponsorships, or working together? Reach out to Longhorn Baja Racing.</p>
            <a className="contact-email" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <a className="text-link" href={siteConfig.sponsorUrl} target="_blank" rel="noopener noreferrer">View sponsorship information <Arrow /></a>
          </article>
        </div>
      </div>
    </section>
  )
}

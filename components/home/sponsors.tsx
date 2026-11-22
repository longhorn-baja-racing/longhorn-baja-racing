import Image from "next/image"
import SectionIntro from "@/components/site/section-intro"
import { asset, siteConfig } from "@/lib/site"
import { sponsors, tiers, type Sponsor, type SponsorTier } from "@/lib/sponsors"

// Title and gold sponsors get the large cards at the top.
const featuredTiers: SponsorTier[] = ["title", "gold"]
const featured = sponsors.filter((s) => featuredTiers.includes(s.tier))
const tierLabel = (id: SponsorTier) => tiers.find((t) => t.id === id)?.label ?? id
import Arrow from "@/components/site/arrow"

function Logo({ sponsor }: { sponsor: Sponsor }) {
  const src = sponsor.logo.startsWith("http") ? sponsor.logo : asset(`/sponsors/${sponsor.logo}`)
  const inner = (
    <>
      <span className="sponsor-logo">
        <Image src={src} alt={sponsor.name} width={240} height={120} className={sponsor.invert ? "invert" : undefined} />
      </span>
      <span className="sponsor-name">
        {sponsor.name}
        {sponsor.url && <span className="sponsor-arrow"><Arrow direction="up-right" /></span>}
      </span>
    </>
  )
  return sponsor.url ? (
    <a className="sponsor" href={sponsor.url} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <div className="sponsor">{inner}</div>
  )
}

export default function Sponsors() {
  return (
    <section id="sponsors" className="section" aria-labelledby="sponsors-title">
      <div className="shell">
        <SectionIntro
          index="04"
          label="Sponsors"
          id="sponsors-title"
          title={<>Built with<br />our partners.</>}
          lede="The organizations, shops, and engineering partners that help turn our designs into a competition-ready vehicle."
        />
        <ul className="sponsors-featured">
          {featured.map((s) => (
            <li key={s.name} className={`featured featured--${s.tier} reveal`}>
              <p className="featured-tier">{tierLabel(s.tier)}</p>
              <Logo sponsor={s} />
            </li>
          ))}
        </ul>
        <div className="tiers">
          {tiers.filter((t) => !featuredTiers.includes(t.id)).map((tier) => {
            const list = sponsors.filter((s) => s.tier === tier.id)
            if (!list.length) return null
            return (
              <div key={tier.id} className="tier reveal">
                <h3 className="tier-label">{tier.label}</h3>
                <ul className="tier-logos">
                  {list.map((s) => <li key={s.name}><Logo sponsor={s} /></li>)}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="sponsor-cta reveal">
          <div>
            <p className="eyebrow eyebrow--plain">Partner with us</p>
            <p className="sponsor-cta-title">Put your name on the machine.</p>
            <p className="sponsor-cta-text">Questions about the team, sponsorships, or working together? Our sponsorship packet covers how to get involved.</p>
          </div>
          <div className="sponsor-cta-actions">
            <a className="button button--primary" href={siteConfig.sponsorUrl} target="_blank" rel="noopener noreferrer">Become a Sponsor <Arrow /></a>
            <a className="button button--ghost" href={`mailto:${siteConfig.email}`}>Email the team</a>
          </div>
        </div>
      </div>
    </section>
  )
}

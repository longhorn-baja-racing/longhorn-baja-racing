import Image from "next/image"
import Link from "next/link"
import SeasonNote from "@/components/seasonal/season-note"
import { asset, sections, siteConfig } from "@/lib/site"

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/longhornbajaracing/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/longhorn-baja-racing/" },
  { label: "GitHub", href: "https://github.com/longhorn-baja-racing" },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Image src={asset("/lbr-logo.png")} alt="Longhorn Baja Racing" width={56} height={56} />
          <p className="footer-tagline">Student-built off-road engineering at The University of Texas at Austin.</p>
          <a className="footer-email" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </div>
        <nav aria-label="Footer" className="footer-links">
          <p className="footer-heading">Explore</p>
          <ul>
            {sections.map((s) => (
              <li key={s.id}><Link href={`/#${s.id}`} prefetch={false}>{s.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="footer-links">
          <p className="footer-heading">More</p>
          <ul>
            <li><Link href="/calendar/" prefetch={false}>Team calendar</Link></li>
            <li><Link href="/merch/" prefetch={false}>Full merch catalog</Link></li>
            <li><a href={siteConfig.sponsorUrl} target="_blank" rel="noopener noreferrer">Sponsorship packet</a></li>
            <li><a href={siteConfig.applyUrl} target="_blank" rel="noopener noreferrer">Team application</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <p className="footer-heading">Follow</p>
          <ul>
            {socials.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="shell footer-base">
        <p>&copy; {new Date().getFullYear()} Longhorn Baja Racing. Austin, Texas.</p>
        <SeasonNote />
      </div>
      <p className="footer-wordmark" aria-hidden="true">Longhorn Baja</p>
    </footer>
  )
}

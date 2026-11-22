import Image from "next/image"
import SectionIntro from "@/components/site/section-intro"
import { initials, leads, type Lead } from "@/lib/members"
import { asset } from "@/lib/site"

function LeadCard({ lead, featured }: { lead: Lead; featured?: boolean }) {
  return (
    <li className={`lead reveal ${featured ? "lead--featured" : ""}`}>
      <figure className="lead-photo">
        {lead.image ? (
          <Image src={asset(lead.image)} alt={lead.name} fill sizes={featured ? "(max-width: 640px) 50vw, 20vw" : "(max-width: 640px) 50vw, 16vw"} style={{ objectPosition: lead.focus }} />
        ) : (
          <span className="lead-monogram" aria-hidden="true">{initials(lead.name)}</span>
        )}
      </figure>
      <div className="lead-text">
        <h3 className="lead-name">{lead.name}</h3>
        <p className="lead-role">{lead.role}</p>
      </div>
    </li>
  )
}

export default function Members() {
  const leadership = leads.filter((l) => l.leadership)
  const others = leads.filter((l) => !l.leadership)
  return (
    <section id="members" className="section" aria-labelledby="members-title">
      <div className="shell">
        <SectionIntro
          index="03"
          label="Team"
          id="members-title"
          title={<>The people behind<br />the machine.</>}
          lede="Meet the crew: the students responsible for guiding design, fabrication, operations, and competition."
        />
        <figure className="team-photo reveal">
          <picture>
            <source media="(max-width: 640px)" srcSet={asset("/baja-team-photo-mobile.webp")} />
            <img src={asset("/baja-team-photo.webp")} alt="Longhorn Baja Racing team members together at a racetrack" width={1920} height={1280} loading="lazy" decoding="async" />
          </picture>
          <figcaption>Longhorn Baja Racing</figcaption>
        </figure>

        <h3 className="subhead">Leadership</h3>
        <ul className="leads leads--featured">
          {leadership.map((lead) => <LeadCard key={lead.name} lead={lead} featured />)}
        </ul>
        <h3 className="subhead">Subteam leads</h3>
        <ul className="leads">
          {others.map((lead) => <LeadCard key={lead.name} lead={lead} />)}
        </ul>
      </div>
    </section>
  )
}

import SectionIntro from "@/components/site/section-intro"
import { leads } from "@/lib/members"
import { asset } from "@/lib/site"
import { sponsors } from "@/lib/sponsors"
import { subteams } from "@/lib/subteams"

const statement =
  "Longhorn Baja Racing at The University of Texas at Austin is a hands-on, student-led engineering team where members design, build, test, and race an off-road vehicle for the SAE Baja competition series."

const facts = [
  { value: String(subteams.length), label: "Subteams" },
  { value: String(leads.length), label: "Student leads" },
  { value: String(sponsors.length), label: "Sponsors and partners" },
  { value: "1", label: "Off-road vehicle" },
]

export default function About() {
  return (
    <section id="about" className="section section--sheet" aria-labelledby="about-title">
      <div className="shell">
        <SectionIntro index="01" label="About" id="about-title" title="Who we are" />
        <p className="statement">
          {statement.split(" ").map((word, i) => (
            <span key={i} className="statement-word">{word} </span>
          ))}
        </p>

        <div className="about-grid">
          <figure className="about-photo reveal">
            <picture>
              <source media="(max-width: 640px)" srcSet={asset("/baja-action-mobile.webp")} />
              <img src={asset("/baja-action.webp")} alt="Longhorn Baja Racing vehicle airborne over a dirt jump at competition" width={1100} height={1375} loading="lazy" decoding="async" />
            </picture>
            <figcaption>
              <span>Competition</span>
              <span>Baja SAE</span>
            </figcaption>
          </figure>

          <div className="about-copy">
            <p className="reveal">
              Students gain real world experience by working through the full engineering lifecycle from concept development and CAD to fabrication, testing, and competition while learning directly from experienced teammates and mentors. The team thrives on iteration, problem solving, and getting dirty in the shop, constantly pushing to improve performance, reliability, and durability.
            </p>
            <p className="reveal">
              By competing under real industry constraints like cost, safety regulations, and standardized rules, Longhorn Baja prepares students with practical skills, technical confidence, and teamwork experience that translate directly to careers in automotive and mechanical engineering.
            </p>

            <div className="pillars">
              <article className="pillar reveal">
                <h3 className="pillar-title"><span aria-hidden="true">A</span> Our Mission</h3>
                <p>We aim to give hands-on engineering experience, and foster a community of passionate students dedicated to innovation, teamwork, and excellence in off-road vehicle design and competition.</p>
              </article>
              <article className="pillar reveal">
                <h3 className="pillar-title"><span aria-hidden="true">B</span> Core Belief</h3>
                <p>We believe interested students should have meaningful opportunities to get involved in motorsports. We foster a collaborative environment where members can develop practical skills, learn from one another, and contribute to the team&apos;s success.</p>
              </article>
            </div>
          </div>
        </div>

        <dl className="facts">
          {facts.map((f) => (
            <div key={f.label} className="fact reveal">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

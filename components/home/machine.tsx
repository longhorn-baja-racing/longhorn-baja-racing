import SectionIntro from "@/components/site/section-intro"
import Image from "next/image"
import { asset } from "@/lib/site"
import { subteams, type SubteamId } from "@/lib/subteams"
import MachineIndex from "./machine-index"

// Engineering subteams own a part of the car, and their artwork is the team's own
// CAD. Operations subteams keep the team running; their cards stay text-only.
const engineering: readonly SubteamId[] = ["powertrain", "dynamics", "chassis", "ergonomics", "electronics", "software"]

const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"]
const countWord = (n: number) => words[n] ?? String(n)

export default function Machine() {
  const total = String(subteams.length).padStart(2, "0")
  return (
    <section id="subteams" className="machine" data-scene-section aria-labelledby="subteams-title">
      <div className="shell machine-intro" data-shot="overview">
        <SectionIntro
          index="02"
          label="Subteams"
          id="subteams-title"
          title={<>{countWord(subteams.length)} subteams.<br />One machine.</>}
          lede="Ten disciplines, one vehicle. Scroll through the car to see how each group turns engineering decisions into race-day performance."
        >
          <ul className="machine-legend" aria-label="Subteam groups">
            <li><span className="legend-swatch legend-swatch--eng" aria-hidden="true" />{engineering.length} engineering</li>
            <li><span className="legend-swatch legend-swatch--ops" aria-hidden="true" />{subteams.length - engineering.length} operations</li>
          </ul>
        </SectionIntro>
      </div>

      <ol className="machine-steps">
        {subteams.map((s, i) => {
          const eng = engineering.includes(s.id)
          return (
            <li key={s.id} id={s.id} className="step" data-shot={s.id}>
              <article className="step-card" aria-labelledby={`${s.id}-title`}>
                <p className="step-meta">
                  <span className="step-count">{String(i + 1).padStart(2, "0")} / {total}</span>
                  <span className={`step-kind ${eng ? "step-kind--eng" : "step-kind--ops"}`}>{eng ? "Engineering" : "Operations"}</span>
                </p>
                <h3 id={`${s.id}-title`} className="step-title">{s.title}</h3>
                <p className="step-lede">{s.description}</p>
                <p className="step-body">{s.details}</p>
                {eng && (
                  <figure className="step-figure">
                    <Image src={asset(s.image)} alt={s.imageAlt} width={806} height={700} sizes="(max-width: 640px) 90vw, 420px" />
                    <figcaption>From the team CAD</figcaption>
                  </figure>
                )}
              </article>
            </li>
          )
        })}
      </ol>
      <MachineIndex items={subteams.map((s) => ({ id: s.id, title: s.title }))} />
    </section>
  )
}

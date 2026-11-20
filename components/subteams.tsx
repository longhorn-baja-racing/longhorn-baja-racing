import { Section } from "@/components/section"
import SubteamCard from "@/components/subteam-card"
import { subteams } from "@/lib/subteams"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default function Subteams() {
  return (
      <Section title="Subteams" label="WHAT WE BUILD" anchor="team">
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/65">
          Ten disciplines, one vehicle. Select a card to see how each group turns engineering decisions into race-day performance.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subteams.map(({ id, title, description, details, image, imageAlt }) => (
              <SubteamCard key={id} id={id} title={title} description={description} details={details} image={`${base}${image}`} imageAlt={imageAlt} />
          ))}
        </div>
      </Section>
  )
}

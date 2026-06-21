import { Section } from "@/components/section"
import SubteamCard from "@/components/subteam-card"

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

const subteam_list = [
  {
    id: "powertrain",
    title: "Powertrain",
    description: "Getting power from the engine to the wheels.",
    details:
        "The Powertrain Subteam is responsible for designing, selecting, and integrating all components that " +
        "transmit power from the engine to the wheels, ensuring optimal performance, reliability, and efficiency.",
    image: `${base}/subteams/powertrain.avif`,
    imageAlt: "Longhorn Baja Racing Powertrain Subteam Image Design.",
  },
  {
    id: "dynamics",
    title: "Dynamics",
    description: "Suspension, steering, and braking.",
    details:
        "The Dynamics Subteam focuses on the development of the vehicle's suspension, steering, and braking " +
        "capabilities, ensuring a safe driving experience for the driver while maximizing control on track.",
    image: `${base}/subteams/dynamics.avif`,
    imageAlt: "Longhorn Baja Racing Dynamics Subteam Design Image.",
  },
  {
    id: "chassis",
    title: "Chassis",
    description: "Vehicle frame design and manufacturing.",
    details:
        "The Chassis Subteam designs, manufactures, and tests the vehicle's frame to ensure it is strong, " +
        "lightweight, and safe.",
    image: `${base}/subteams/chassis.avif`,
    imageAlt: "Longhorn Baja Racing Chassis Subteam Design Image.",
  },
  {
    id: "ergonomics",
    title: "Ergonomics",
    description: "Driver comfort and safety.",
    details:
        "The Ergonomics Subteam enhances the driver's comfort and ease of control to produce optimal performance " +
        "without sacrificing safety precautions or reliability.",
    image: `${base}/subteams/ergonomics.avif`,
    imageAlt: "Longhorn Baja Racing Ergonomics Subteam Design Image.",
  },
  {
    id: "electronics",
    title: "Electronics",
    description: "Telemetry, sensors, and electronics.",
    details: "The Electronics Subteam gathers information about the vehicle through the use of sensors and " +
        "ensures driver safety with brake lights and kill switches.",
    image: `${base}/subteams/electronics.avif`,
    imageAlt: "Longhorn Baja Racing Electronics Subteam Image.",
  },
  {
    id: "software",
    title: "Software",
    description: "Website, data analysis, and simulation.",
    details: "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
        "analysis to enhance overall performance for future competition vehicles.",
    image: `${base}/subteams/software.avif`,
    imageAlt: "Longhorn Baja Racing Software Subteam Image.",
  },
  {
    id: "public-relations",
    title: "Public Relations",
    description: "Public communications and social media.",
    details: "The Public Relations subteam works with our presence on social media, managing " +
        "our team's LinkedIn and Instagram profiles.",
    image: `${base}/subteams/pr.jpeg`,
    imageAlt: "Longhorn Baja Racing PR Subteam Image.",
  },
  {
    id: "business",
    title: "Business",
    description: "Rules compliance, finances, and team operations.",
    details: "The Business subteam manages our car's compliance with the SAE rules, finances," +
        " and involvement with UT Austin.",
    image: `${base}/subteams/business.jpeg`,
    imageAlt: "Longhorn Baja Racing Business Subteam Image.",
  },
  {
    id: "corporate-relations",
    title: "Corporate Relations",
    description: "Corporate outreach and sponsorships.",
    details: "The Corporate Relations subteam manages relationships with other companies, " +
        "focusing on outreach and sponsorships.",
    image: `${base}/subteams/cr.jpeg`,
    imageAlt: "Longhorn Baja Racing CR Subteam Image.",
  },
  {
    id: "logistics",
    title: "Logistics",
    description: "Transportation, storage, and event coordination.",
    details: "The Logistics subteam manages transportation, storage, and event coordination.",
    image: `${base}/subteams/logistics.jpeg`,
    imageAlt: "Longhorn Baja Racing Logistics Subteam Image.",
  },
]

export default function Subteams() {
  return (
      <Section title="Subteams" label="WHAT WE BUILD" anchor="team">
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/65">
          Ten disciplines, one vehicle. Select a card to see how each group turns engineering decisions into race-day performance.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subteam_list.map((subteam) => (
              <SubteamCard key={subteam.id} {...subteam} />
          ))}
        </div>
      </Section>
  )
}

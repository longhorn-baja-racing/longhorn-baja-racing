import { Section } from "@/components/section"
import SubteamCard from "@/components/subteam-card"
import { imageConfigDefault } from "next/dist/shared/lib/image-config";

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
]

export default function Subteams() {
  return (
      <Section title="Subteams" label="WHAT WE BUILD" anchor="team">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subteam_list.map((subteam) => (
              <SubteamCard key={subteam.id} {...subteam} />
          ))}
        </div>
      </Section>
  )
}

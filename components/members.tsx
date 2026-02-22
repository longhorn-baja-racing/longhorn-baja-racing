import { Section } from "@/components/section"
import MemberCard from "@/components/member-card";

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

const member_list = [
  {
    id: "Yash Tate",
    title: "Yash Tate",
    description: "Powertrain Lead",
    details:
        "The Powertrain Subteam is responsible for designing, selecting, and integrating all components that " +
        "transmit power from the engine to the wheels, ensuring optimal performance, reliability, and efficiency.",
    image: `${base}/members/yashtate.jpg`,
  },
  {
    id: "Retvin Pant",
    title: "Retvin Pant",
    description: "Dynamics Lead",
    details:
        "The Dynamics Subteam focuses on the development of the vehicle's suspension, steering, and braking " +
        "capabilities, ensuring a safe driving experience for the driver while maximizing control on track.",
    image: `${base}/members/retvinpant.jpg`,
  },
  {
    id: "Jestin Castillo",
    title: "Jestin Castillo",
    description: "Ergonomics Lead",
    details:
        "The Chassis Subteam designs, manufactures, and tests the vehicle's frame to ensure it is strong, " +
        "lightweight, and safe.",
    image: `${base}/members/jestincastillo.jpg`,
  },
  {
    id: "Peter Vlahakis",
    title: "Peter Vlahakis",
    description: "Chassis Lead",
    details:
        "The Ergonomics Subteam enhances the driver's comfort and ease of control to produce optimal performance " +
        "without sacrificing safety precautions or reliability.",
    image: `${base}/members/petervlahakis.jpg`,
  },
  {
    id: "Boen Kelly",
    title: "Boen Kelly",
    description: "Manufacturing Lead",
    details: "The Electronics Subteam gathers information about the vehicle through the use of sensors and " +
        "ensures driver safety with brake lights and kill switches.",
    image: `${base}/members/boenkelly.jpg`,
  },
  {
    id: "Alex Grinman Rivera",
    title: "Alex Grinman Rivera",
    description: "Software Lead",
    details: "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
        "analysis to enhance overall performance for future competition vehicles.",
    image: `${base}/members/alexgrinmanrivera.jpg`,
  },
  {
    id: "Ayan Arfi",
    title: "Ayan Arfi",
    description: "Electronics Co-Lead and Business Lead",
    details: "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
        "analysis to enhance overall performance for future competition vehicles.",
    image: `${base}/members/ayanarfi.jpg`,
  },
  {
    id: "Tanush Thirunagari",
    title: "Tanush Thirunagari",
    description: "Electronics Co-Lead",
    details: "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
        "analysis to enhance overall performance for future competition vehicles.",
    image: `${base}/members/tanushthirungari.jpg`,
  },
  {
    id: "Julian Whiteley",
    title: "Julian Whiteley",
    description: "R&D Lead",
    details: "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
        "analysis to enhance overall performance for future competition vehicles.",
    image: `${base}/members/julianwhiteley.jpg`,
  },
  {
    id: "Aara Chawathe",
    title: "Aara Chawathe",
    description: "Corporate Relations Lead",
    details: "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
        "analysis to enhance overall performance for future competition vehicles.",
    image: `${base}/members/aarachawathe.jpg`,
  },
  {
    id: "Shreya Lokhande",
    title: "Shreya Lokhande",
    description: "Public Relations Lead",
    details: "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
        "analysis to enhance overall performance for future competition vehicles.",
    image: `${base}/members/shreyalokhande.jpg`,
  },
]

export default function Members() {
  return (
      <Section title="Members" label="WHO WE ARE" anchor="members">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {member_list.map((member) => (
              <MemberCard key={member.id} {...member} />
          ))}
        </div>
      </Section>
  )
}

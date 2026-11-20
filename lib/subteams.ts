// Single source of truth for the team's subteams. Public metadata only:
// never put access codes, protected resource links, or other secrets here.

export const subteamIds = [
  "powertrain",
  "dynamics",
  "chassis",
  "ergonomics",
  "electronics",
  "software",
  "public-relations",
  "business",
  "corporate-relations",
  "logistics",
] as const

export type SubteamId = (typeof subteamIds)[number]

export type Subteam = {
  /** Stable slug. Also used as the page anchor on /subteams/. */
  id: SubteamId
  title: string
  /** Short summary shown on the card. */
  description: string
  /** Longer text shown when the card is expanded. */
  details: string
  /** Path under public/, without the base path. */
  image: `/${string}`
  imageAlt: string
  /** Inactive subteams stay typed and referenceable but are hidden from listings. */
  active: boolean
}

const subteamData: Record<SubteamId, Omit<Subteam, "id">> = {
  powertrain: {
    title: "Powertrain",
    description: "Getting power from the engine to the wheels.",
    details:
      "The Powertrain Subteam is responsible for designing, selecting, and integrating all components that " +
      "transmit power from the engine to the wheels, ensuring optimal performance, reliability, and efficiency.",
    image: "/subteams/powertrain.avif",
    imageAlt: "Longhorn Baja Racing Powertrain Subteam Image Design.",
    active: true,
  },
  dynamics: {
    title: "Dynamics",
    description: "Suspension, steering, and braking.",
    details:
      "The Dynamics Subteam focuses on the development of the vehicle's suspension, steering, and braking " +
      "capabilities, ensuring a safe driving experience for the driver while maximizing control on track.",
    image: "/subteams/dynamics.avif",
    imageAlt: "Longhorn Baja Racing Dynamics Subteam Design Image.",
    active: true,
  },
  chassis: {
    title: "Chassis",
    description: "Vehicle frame design and manufacturing.",
    details:
      "The Chassis Subteam designs, manufactures, and tests the vehicle's frame to ensure it is strong, " +
      "lightweight, and safe.",
    image: "/subteams/chassis.avif",
    imageAlt: "Longhorn Baja Racing Chassis Subteam Design Image.",
    active: true,
  },
  ergonomics: {
    title: "Ergonomics",
    description: "Driver comfort and safety.",
    details:
      "The Ergonomics Subteam enhances the driver's comfort and ease of control to produce optimal performance " +
      "without sacrificing safety precautions or reliability.",
    image: "/subteams/ergonomics.avif",
    imageAlt: "Longhorn Baja Racing Ergonomics Subteam Design Image.",
    active: true,
  },
  electronics: {
    title: "Electronics",
    description: "Telemetry, sensors, and electronics.",
    details:
      "The Electronics Subteam gathers information about the vehicle through the use of sensors and " +
      "ensures driver safety with brake lights and kill switches.",
    image: "/subteams/electronics.avif",
    imageAlt: "Longhorn Baja Racing Electronics Subteam Image.",
    active: true,
  },
  software: {
    title: "Software",
    description: "Website, data analysis, and simulation.",
    details:
      "The Software Subteam visualizes live sensor data and captures vehicle telemetry for simulation " +
      "analysis to enhance overall performance for future competition vehicles.",
    image: "/subteams/software.avif",
    imageAlt: "Longhorn Baja Racing Software Subteam Image.",
    active: true,
  },
  "public-relations": {
    title: "Public Relations",
    description: "Public communications and social media.",
    details:
      "The Public Relations subteam works with our presence on social media, managing " +
      "our team's LinkedIn and Instagram profiles.",
    image: "/subteams/pr.jpeg",
    imageAlt: "Longhorn Baja Racing PR Subteam Image.",
    active: true,
  },
  business: {
    title: "Business",
    description: "Rules compliance, finances, and team operations.",
    details:
      "The Business subteam manages our car's compliance with the SAE rules, finances," +
      " and involvement with UT Austin.",
    image: "/subteams/business.jpeg",
    imageAlt: "Longhorn Baja Racing Business Subteam Image.",
    active: true,
  },
  "corporate-relations": {
    title: "Corporate Relations",
    description: "Corporate outreach and sponsorships.",
    details:
      "The Corporate Relations subteam manages relationships with other companies, " +
      "focusing on outreach and sponsorships.",
    image: "/subteams/cr.jpeg",
    imageAlt: "Longhorn Baja Racing CR Subteam Image.",
    active: true,
  },
  logistics: {
    title: "Logistics",
    description: "Transportation, storage, and event coordination.",
    details: "The Logistics subteam manages transportation, storage, and event coordination.",
    image: "/subteams/logistics.jpeg",
    imageAlt: "Longhorn Baja Racing Logistics Subteam Image.",
    active: true,
  },
}

/** Every subteam, active or not, in display order. */
export const allSubteams: readonly Subteam[] = subteamIds.map((id) => ({ id, ...subteamData[id] }))

/** Active subteams in display order. */
export const subteams: readonly Subteam[] = allSubteams.filter((subteam) => subteam.active)

export function isSubteamId(value: unknown): value is SubteamId {
  return typeof value === "string" && (subteamIds as readonly string[]).includes(value)
}

export function getSubteam(id: SubteamId): Subteam {
  return { id, ...subteamData[id] }
}

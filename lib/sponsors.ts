// Sponsors and partner organizations, grouped by tier in display order.
// Local logos live in public/sponsors/; remote logos must use a host allowed in next.config.ts.

export type SponsorTier = "title" | "gold" | "bronze" | "general" | "partner"

export type Sponsor = {
  name: string
  logo: string
  tier: SponsorTier
  url?: string
  /** Logos drawn in white for dark backgrounds are inverted on the light tile. */
  invert?: boolean
}

export const tiers: { id: SponsorTier; label: string }[] = [
  { id: "title", label: "Title Sponsor" },
  { id: "gold", label: "Gold Sponsor" },
  { id: "bronze", label: "Bronze Sponsors" },
  { id: "general", label: "General Sponsors" },
  { id: "partner", label: "Partner Organizations" },
]

export const sponsors: readonly Sponsor[] = [
  { name: "Renesas", logo: "renesas.avif", tier: "title", url: "https://www.renesas.com/en" },
  { name: "Rally Ready", logo: "rallyready.jpg", tier: "gold", url: "https://rallyready.com" },
  { name: "Walker Department of Mechanical Engineering", logo: "walker_department.svg", tier: "bronze", url: "https://www.me.utexas.edu" },
  { name: "SCCA", logo: "scca.avif", tier: "bronze", url: "https://lonestarscca.org" },
  { name: "United Mechanical", logo: "united_mechanical.avif", tier: "bronze" },
  { name: "Oshcut", logo: "oshcut.png", tier: "bronze", url: "https://www.oshcut.com" },
  { name: "Carlstar", logo: "carlstar.png", tier: "bronze", url: "https://www.carlstar.com" },
  { name: "Makistry", logo: "makistry_logo.avif", tier: "general", url: "https://makistry.com" },
  { name: "Solidworks", logo: "solidworks.avif", tier: "general", url: "https://my.solidworks.com" },
  { name: "Ansys", logo: "ansys.avif", tier: "general", url: "https://www.ansys.com" },
  { name: "Umatek", logo: "umatek.avif", tier: "general", url: "https://www.umatek.com" },
  { name: "AFCO Racing", logo: "afco.png", tier: "general", url: "https://afcoracing.com" },
  { name: "Longhorn Sim Racing", logo: "https://www.longhornsimracing.org/brand/logos/white_logo2.png", tier: "partner", url: "https://www.longhornsimracing.org", invert: true },
  { name: "LCC", logo: "lcc.avif", tier: "partner", url: "https://texaslcc.com" },
]

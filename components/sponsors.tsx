"use client"

import Section from "@/components/section"
import Image from "next/image"

const sponsorList = [
  { name: "Renesas", logo: "renesas.avif", tier: "title", url: "https://www.renesas.com/en" },
  { name: "Rally Ready", logo: "rallyready.jpg", tier: "gold", url: "https://rallyready.com" },
  { name: "Walker Department of Mechancial Engineering", logo: "walker_department.svg", tier: "bronze", url: "https://www.me.utexas.edu" },
  { name: "SCCA", logo: "scca.avif", tier: "bronze", url: "https://lonestarscca.org" },
  { name: "United Mechanical", logo: "united_mechanical.avif", tier: "bronze", url: "https://www.unitedmechanical.com" },
  { name: "Oshcut", logo: "oshcut.png", tier: "bronze", url: "https://www.oshcut.com" },
  { name: "Carlstar", logo: "carlstar.png", tier: "bronze", url: "https://www.carlstar.com" },
  { name: "Makistry", logo: "makistry_logo.avif", tier: "general", url: "https://makistry.com" },
  { name: "Solidworks", logo: "solidworks.avif", tier: "general", url: "https://my.solidworks.com" },
  { name: "Ansys", logo: "ansys.avif", tier: "general", url: "https://www.ansys.com" },
  { name: "Umatek", logo: "umatek.avif", tier: "general", url: "https://www.umatek.com" },
  { name: "AFCO Racing", logo: "afco.png", tier: "general", url: "https://afcoracing.com" },
  { name: "LSR", logo: "lsr.avif", tier: "partner org", url: "https://lsracing.com" },
  { name: "LCC", logo: "lcc.avif", tier: "partner org", url: "https://texaslcc.com" }
];

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

function tierLabel(tier: string) {
  const map: Record<string, string> = {
    title: "Title Sponsor",
    gold: "Gold Sponsor",
    bronze: "Bronze Sponsor",
    general: "General Sponsor",
    "partner org": "Partner Organization",
  }
  return map[tier] ?? tier
}

export default function Sponsors() {
  return (
      <Section label="OUR PARTNERS" title="Sponsors" anchor="sponsors">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sponsorList.map((sponsor) => {
            const outline =
                sponsor.tier === "title"
                    ? "border-2 border-white"
                    : sponsor.tier === "gold"
                        ? "ring-2 ring-yellow-400"
                        : sponsor.tier === "bronze"
                            ? "ring-2 ring-amber-700"
                            : ""

            const labelClass =
                sponsor.tier === "title"
                    ? "text-lg font-bold mb-3 text-center"
                    : "text-sm font-semibold mb-2 text-center"

            const card = (
                <div
                    className={`flex flex-col items-center p-8 bg-card border border-border rounded-lg hover:border-primary transition-colors ${outline} ${sponsor.url ? "cursor-pointer" : ""}`}
                >
                  <div className={labelClass}>{tierLabel(sponsor.tier)}</div>
                  <Image
                      src={`${base}/sponsors/${sponsor.logo}`}
                      alt={sponsor.name}
                      width={200}
                      height={120}
                      className="w-full h-auto max-h-24 object-contain"
                  />
                  <div className="pt-4 text-sm">{sponsor.name}</div>
                </div>
            )

            return sponsor.url ? (
                <a key={sponsor.name} href={sponsor.url} target="_blank" rel="noopener noreferrer">
                  {card}
                </a>
            ) : (
                <div key={sponsor.name}>{card}</div>
            )
          })}
        </div>
      </Section>
  )
}

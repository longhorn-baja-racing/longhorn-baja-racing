"use client"

import Section from "@/components/section"
import Image from "next/image"

const sponsorList = [
  { name: "Renesas", logo: "renesas.avif", tier: "title" },
  { name: "Rally Ready", logo: "rallyready.jpg", tier: "gold" },
  { name: "Walker Department of Mechancial Engineering", logo: "walker_department.svg", tier: "bronze" },
  { name: "SCCA", logo: "scca.avif", tier: "bronze" },
  { name: "United Mechanical", logo: "united_mechanical.avif", tier: "bronze" },
  { name: "Oshcut", logo: "oshcut.png", tier: "bronze" },
  { name: "Carlstar", logo: "carlstar.png", tier: "bronze" },
  { name: "J&D Auto", logo: "jdauto.avif", tier: "general" },
  { name: "Makistry", logo: "makistry_logo.avif", tier: "general" },
  { name: "Solidworks", logo: "solidworks.avif", tier: "general" },
  { name: "Ansys", logo: "ansys.avif", tier: "general" },
  { name: "Umatek", logo: "umatek.avif", tier: "general" },
  { name: "AFCO", logo: "afco.png", tier: "general" },
  { name: "LSR", logo: "lsr.avif", tier: "partner org" },
  { name: "LCC", logo: "lcc.avif", tier: "partner org" }
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

            return (
                <div
                    key={sponsor.name}
                    className={`flex flex-col items-center p-8 bg-card border border-border rounded-lg hover:border-primary transition-colors ${outline}`}
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
          })}
        </div>
      </Section>
  )
}

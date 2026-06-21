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
        <div className="mb-10 flex flex-col gap-3 border-l-2 border-primary pl-5">
          <p className="max-w-2xl text-lg leading-relaxed text-white/65">
            The organizations, shops, and engineering partners that help turn our designs into a competition-ready vehicle.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sponsorList.map((sponsor) => {
            const outline =
                sponsor.tier === "title"
                    ? "border-primary"
                    : sponsor.tier === "gold"
                        ? "border-yellow-500/70"
                        : sponsor.tier === "bronze"
                            ? "border-amber-700/70"
                            : "border-white/10"

            const labelClass =
                sponsor.tier === "title"
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white/65"

            const card = (
                <div
                    className={`industrial-card group relative flex min-h-56 flex-col items-center justify-between overflow-hidden border p-4 transition duration-300 hover:-translate-y-1 hover:border-primary ${outline} ${sponsor.url ? "cursor-pointer" : ""}`}
                >
                  <div className={`absolute left-0 top-0 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${labelClass}`}>
                    {tierLabel(sponsor.tier)}
                  </div>
                  <div className="mt-8 flex min-h-32 w-full items-center justify-center bg-white/[0.96] p-5">
                    <Image
                        src={`${base}/sponsors/${sponsor.logo}`}
                        alt={sponsor.name}
                        width={200}
                        height={120}
                        className="max-h-20 w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <span className="text-sm font-bold uppercase tracking-[0.08em] text-white/80">{sponsor.name}</span>
                    <span className="text-xl text-primary" aria-hidden="true">&#8599;</span>
                  </div>
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

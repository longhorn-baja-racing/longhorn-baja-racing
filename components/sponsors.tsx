import Section from "@/components/section"
import Image from "next/image"

// width/height: intrinsic logo size after trimming (see scripts/normalize-sponsor-logos.mjs).
const sponsorList = [
  { name: "Renesas", logo: "renesas.webp", width: 520, height: 83, tier: "title", url: "https://www.renesas.com/en" },
  { name: "Rally Ready", logo: "rallyready.webp", width: 160, height: 160, tier: "gold", url: "https://rallyready.com" },
  { name: "Walker Department of Mechanical Engineering", logo: "walker_department.svg", width: 405, height: 110, tier: "bronze", url: "https://www.me.utexas.edu" },
  { name: "SCCA", logo: "scca.webp", width: 160, height: 160, tier: "bronze", url: "https://lonestarscca.org" },
  { name: "United Mechanical", logo: "united_mechanical.webp", width: 190, height: 74, tier: "bronze" },
  { name: "Oshcut", logo: "oshcut.webp", width: 193, height: 40, tier: "bronze", url: "https://www.oshcut.com" },
  { name: "Carlstar", logo: "carlstar.webp", width: 520, height: 53, tier: "bronze", url: "https://www.carlstar.com" },
  { name: "Makistry", logo: "makistry_logo.webp", width: 90, height: 88, tier: "general", url: "https://makistry.com" },
  { name: "Solidworks", logo: "solidworks.webp", width: 153, height: 160, tier: "general", url: "https://my.solidworks.com" },
  { name: "Ansys", logo: "ansys.webp", width: 160, height: 160, tier: "general", url: "https://www.ansys.com" },
  { name: "Umatek", logo: "umatek.webp", width: 169, height: 112, tier: "general", url: "https://www.umatek.com" },
  { name: "AFCO Racing", logo: "afco.webp", width: 520, height: 142, tier: "general", url: "https://afcoracing.com" },
  { name: "Longhorn Sim Racing", logo: "https://www.longhornsimracing.org/brand/logos/white_logo2.png", width: 972, height: 326, tier: "partner org", url: "https://www.longhornsimracing.org" },
  { name: "LCC", logo: "lcc.webp", width: 160, height: 160, tier: "partner org", url: "https://texaslcc.com" }
];

// Gives logos of different shapes a similar visual weight: square marks render
// 80px tall, wider wordmarks get longer but shorter, capped at 260px wide.
// Logos are never drawn larger than their source file, which would blur them.
function logoSize(width: number, height: number) {
  const ratio = width / height
  let displayHeight = 80 * Math.pow(ratio, -0.4)
  let displayWidth = displayHeight * ratio
  const cap = Math.min(260, width)
  if (displayWidth > cap) {
    displayWidth = cap
    displayHeight = displayWidth / ratio
  }
  return { width: Math.round(displayWidth), height: Math.round(displayHeight) }
}

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

            const logoSrc = sponsor.logo.startsWith("http")
                ? sponsor.logo
                : `${base}/sponsors/${sponsor.logo}`

            const card = (
                <div
                    className={`industrial-card group relative flex min-h-56 flex-col items-center justify-between overflow-hidden border p-4 transition duration-300 hover:-translate-y-1 hover:border-primary ${outline} ${sponsor.url ? "cursor-pointer" : ""}`}
                >
                  <div className={`absolute left-0 top-0 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${labelClass}`}>
                    {tierLabel(sponsor.tier)}
                  </div>
                  <div className="mt-8 flex min-h-32 w-full items-center justify-center bg-white/[0.96] p-5">
                    <Image
                        src={logoSrc}
                        alt={sponsor.name}
                        {...logoSize(sponsor.width, sponsor.height)}
                        className={`max-w-full object-contain transition duration-300 group-hover:scale-105 ${sponsor.name === "Longhorn Sim Racing" ? "invert" : ""}`}
                    />
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <span className="text-sm font-bold uppercase tracking-[0.08em] text-white/80">{sponsor.name}</span>
                    {sponsor.url && <span className="text-xl text-primary-text" aria-hidden="true">&#8599;</span>}
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

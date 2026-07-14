"use client"

import Image from "next/image"
import { BookOpenCheck, Cable, Camera, Handshake, Laptop, Truck, type LucideIcon } from "lucide-react"
import { useState } from "react"

type SubteamVisual =
  | "electronics"
  | "software"
  | "public-relations"
  | "business"
  | "corporate-relations"
  | "logistics"

interface SubteamCardProps {
  id: string
  title: string
  description: string
  details: string
  image: string
  imageAlt: string
  imagePosition?: string
  visual?: SubteamVisual
}

const visualDetails: Record<SubteamVisual, { icon: LucideIcon; labels: string[] }> = {
  electronics: {
    icon: Cable,
    labels: ["Sensors", "Wiring", "Safety circuits"],
  },
  software: {
    icon: Laptop,
    labels: ["Telemetry", "Simulation", "Data analysis"],
  },
  "public-relations": {
    icon: Camera,
    labels: ["Photography", "Social media", "Team stories"],
  },
  business: {
    icon: BookOpenCheck,
    labels: ["SAE rules", "Budgeting", "Operations"],
  },
  "corporate-relations": {
    icon: Handshake,
    labels: ["Sponsors", "Outreach", "Partnerships"],
  },
  logistics: {
    icon: Truck,
    labels: ["Transport", "Equipment", "Race-day setup"],
  },
}

export default function SubteamCard({
  id,
  title,
  description,
  details,
  image,
  imageAlt,
  imagePosition = "center",
  visual,
}: SubteamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const visualInfo = visual ? visualDetails[visual] : undefined
  const VisualIcon = visualInfo?.icon

  return (
    <button
      id={id}
      type="button"
      onClick={() => setIsExpanded((expanded) => !expanded)}
      className="group relative h-72 overflow-hidden border border-white/10 bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      aria-expanded={isExpanded}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className={`object-cover transition duration-500 ${isExpanded ? "scale-105 blur-sm" : "group-hover:scale-105"}`}
        style={{ objectPosition: imagePosition }}
      />
      <div className={`absolute inset-0 transition duration-300 ${isExpanded ? "bg-black/80" : "bg-gradient-to-t from-black via-black/35 to-black/5"}`} />
      <div className="absolute inset-y-0 left-0 w-1 bg-primary transition-all duration-300 group-hover:w-2" />

      {visualInfo && VisualIcon && (
        <div
          className={`absolute right-4 top-16 w-40 border border-white/15 bg-black/70 p-3 backdrop-blur-sm transition duration-300 ${
            isExpanded ? "translate-x-3 opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        >
          <div className="mb-2 flex items-center gap-2 border-b border-white/15 pb-2">
            <VisualIcon className="h-4 w-4 text-primary" strokeWidth={2.25} />
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/65">What they work on</span>
          </div>
          <div className="space-y-1.5">
            {visualInfo.labels.map((label) => (
              <div key={label} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-white/85">
                <span className="h-1.5 w-1.5 bg-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
            Subteam
          </span>
          <span className="font-mono text-xs text-white/45">{isExpanded ? "CLOSE" : "EXPLORE +"}</span>
        </div>

        <div className="relative">
          <h3 className="text-2xl font-black uppercase tracking-[-0.025em] text-white">{title}</h3>
          <p className={`mt-2 leading-relaxed transition text-white/70 ${isExpanded ? "text-base" : "text-sm"}`}>
            {isExpanded ? details : description}
          </p>
        </div>
      </div>
    </button>
  )
}

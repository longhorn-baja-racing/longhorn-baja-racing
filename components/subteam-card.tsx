"use client"

import Image from "next/image"
import {
  Camera,
  CircuitBoard,
  ClipboardList,
  Handshake,
  Laptop,
  Truck,
  type LucideIcon,
} from "lucide-react"
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
  image?: string
  imageAlt?: string
  visual?: SubteamVisual
}

const visualIcons: Record<SubteamVisual, LucideIcon> = {
  electronics: CircuitBoard,
  software: Laptop,
  "public-relations": Camera,
  business: ClipboardList,
  "corporate-relations": Handshake,
  logistics: Truck,
}

export default function SubteamCard({
  id,
  title,
  description,
  details,
  image,
  imageAlt = "",
  visual,
}: SubteamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const VisualIcon = visual ? visualIcons[visual] : undefined

  return (
    <button
      id={id}
      type="button"
      onClick={() => setIsExpanded((expanded) => !expanded)}
      className="group relative h-72 overflow-hidden border border-white/10 bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      aria-expanded={isExpanded}
    >
      {image ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className={`object-cover transition duration-500 ${isExpanded ? "scale-105 blur-sm" : "group-hover:scale-105"}`}
        />
      ) : VisualIcon ? (
        <div className={`absolute inset-0 flex items-center justify-center bg-[#15181b] transition duration-500 ${isExpanded ? "scale-105 blur-sm" : "group-hover:scale-105"}`}>
          <div className="flex flex-col items-center gap-5">
            <VisualIcon className="h-28 w-28 text-white/75" strokeWidth={1.35} aria-hidden="true" />
            <span className="h-1 w-20 bg-primary" aria-hidden="true" />
          </div>
        </div>
      ) : null}

      <div className={`absolute inset-0 transition duration-300 ${isExpanded ? "bg-black/80" : "bg-gradient-to-t from-black via-black/20 to-transparent"}`} />
      <div className="absolute inset-y-0 left-0 w-1 bg-primary transition-all duration-300 group-hover:w-2" />

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

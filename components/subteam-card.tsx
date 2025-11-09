"use client"

import Image from "next/image"
import { useState } from "react"

interface SubteamCardProps {
  id: string
  title: string
  description: string
  details: string
  image: string
}

export default function SubteamCard({ id, title, description, details, image }: SubteamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isExpanded) {
    return (
        <div
            id={id}
            onClick={() => setIsExpanded(false)}
            className="relative h-64 rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors"
            aria-expanded={true}
        >
          <Image src={image} alt={title} fill className="object-cover filter blur-sm scale-105"/>

          <div className="absolute inset-0 bg-black/60" />
          {/* Expanded content */}
          <div className="p-6 h-full flex flex-col justify-center relative z-10">
            <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
            <p className="text-base text-foreground leading-relaxed">{details}</p>
          </div>
        </div>
    )
  }

  return (
      <div
          id={id}
          onClick={() => setIsExpanded(true)}
          className="relative h-64 rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors"
          aria-expanded={false}
      >
        <Image src={image} alt={title} fill className="object-cover" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <div />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
  )
}

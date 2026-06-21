"use client"

import Image from "next/image"

interface MemberCardProps {
  id: string
  title: string
  description: string
  details: string
  image: string
}

export default function MemberCard({ id, title, description, image }: MemberCardProps) {
  return (
    <article
      id={id}
      className="group relative h-80 overflow-hidden border border-white/10 bg-card transition duration-300 hover:-translate-y-1 hover:border-primary"
    >
      <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/75 p-5 backdrop-blur-sm">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">Team Lead</p>
        <h3 className="text-xl font-black uppercase tracking-[-0.02em] text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/60">{description}</p>
      </div>
      <div className="absolute inset-y-0 left-0 w-1 bg-primary opacity-0 transition group-hover:opacity-100" />
    </article>
  )
}

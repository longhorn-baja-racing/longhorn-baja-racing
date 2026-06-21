"use client"

import Image from "next/image"

interface MemberCardProps {
  id: string
  title: string
  description: string
  details: string
  image?: string
}

export default function MemberCard({ id, title, description, image }: MemberCardProps) {
  return (
    <article
      id={id}
      className="industrial-card group overflow-hidden border border-white/10 transition duration-300 hover:-translate-y-1 hover:border-primary"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        {image ? (
          <>
            <Image src={image} alt="" fill className="scale-110 object-cover opacity-30 blur-xl" aria-hidden="true" />
            <Image src={image} alt={title} fill className="object-contain transition duration-500 group-hover:scale-[1.02]" />
          </>
        ) : (
          <div className="merch-distressed merch-distressed-gray flex h-full items-center justify-center">
            <span className="text-8xl font-black uppercase text-white/15" aria-hidden="true">{title.charAt(0)}</span>
            <span className="absolute bottom-5 text-xs font-black uppercase tracking-[0.25em] text-white/40">Photo Coming Soon</span>
          </div>
        )}
      </div>

      <div className="relative border-t border-white/10 bg-black/75 p-5">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">Team Lead</p>
        <h3 className="text-lg font-black uppercase tracking-[-0.02em] text-white">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/60">{description}</p>
        <div className="absolute inset-y-0 left-0 w-1 bg-primary opacity-0 transition group-hover:opacity-100" />
      </div>
    </article>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Navbar() {
  return (
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/75 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <Image src={`${base}/lbr-logo.png`} alt="Longhorn Baja Logo" width={64} height={64} className="h-10 w-10" />
            <span className="text-lg">{""}</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#" className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
              Home
            </Link>
            <Link href="#about" className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
              About
            </Link>
            <Link href="#team" className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
              Team
            </Link>
            <Link href="#members" className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
              Members
            </Link>
            <Link href="#merch" className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
              Merch
            </Link>
            <Link href="#sponsors" className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
              Sponsors
            </Link>
            <Link href="#" className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-primary">
              Apply
            </Link>
          </div>

          <Button asChild className="rounded-none border border-primary bg-primary px-5 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-primary/80">
            <a href="mailto:longhornbaja@gmail.com" aria-label="Email us">
              Contact Us
            </a>
          </Button>
        </div>
      </nav>
  )
}

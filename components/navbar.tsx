"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Navbar() {
  return (
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-25 border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <Image src={`${base}/lhb-logo.png`} alt="Longhorn Baja Logo" width={40} height={32} className="w-auto h-8" />
            <span className="text-lg">{""}</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Home
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            <Link href="#team" className="text-sm text-muted-foreground hover:text-foreground transition">
              Team
            </Link>
            <Link href="#sponsors" className="text-sm text-muted-foreground hover:text-foreground transition">
              Sponsors
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Apply
            </Link>
          </div>

          <Button
              variant="ghost"
              className="text-foreground hover:bg-primary/10 rounded-lg px-6 py-2 text-sm font-medium border border-primary"
          >
            Contact Us
          </Button>
        </div>
      </nav>
  )
}

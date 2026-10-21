"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""
const links = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/subteams/", label: "Subteams" },
  { href: "/members/", label: "Members" },
  { href: "/calendar/", label: "Calendar" },
  { href: "/merch/", label: "Merch" },
  { href: "/sponsors/", label: "Sponsors" },
  { href: "/contact/", label: "Join / Contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Keep previously shared section links working after the move to pages.
    const legacy: Record<string, string> = { about: "/about/", team: "/subteams/", members: "/members/", merch: "/merch/", sponsors: "/sponsors/" }
    if (pathname === "/") {
      const destination = legacy[window.location.hash.slice(1)]
      if (destination) router.replace(destination)
    }
  }, [pathname, router])

  return (
    <header className="site-header" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus() } }}>
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-6">
        <Link href="/" onClick={() => setOpen(false)} className="flex shrink-0 items-center gap-3" aria-label="Longhorn Baja Racing home">
          <Image src={`${base}/lbr-logo.png`} alt="" width={48} height={48} className="h-12 w-12" />
          <span className="brand-name">Longhorn Baja<span className="block font-mono text-[9px] tracking-[0.16em] text-white/60">THE UNIVERSITY OF TEXAS AT AUSTIN</span></span>
        </Link>
        <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
          {open ? "Close −" : "Menu +"}
        </button>
        <nav id="site-navigation" aria-label="Main navigation" className={`site-nav ${open ? "is-open" : ""}`}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} prefetch={false} aria-current={pathname.replace(/\/$/, "") === href.replace(/\/$/, "") ? "page" : undefined} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

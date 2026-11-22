"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"
import SeasonalDecor from "@/components/seasonal/seasonal-decor"
import { useSeason } from "@/components/seasonal/use-season"
import { asset, sections, siteConfig } from "@/lib/site"
import { isHomePath, scrollToSection } from "./scroll"
import Arrow from "./arrow"

export default function Nav() {
  const pathname = usePathname()
  const home = isHomePath(pathname)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const season = useSeason()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Scroll spy: mark the section under the middle of the screen.
  useEffect(() => {
    if (!home) return
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id)
      },
      { rootMargin: "-50% 0px -50% 0px" },
    )
    els.forEach((el) => io.observe(el))
    const onTop = () => { if (window.scrollY < window.innerHeight * 0.4) setCurrent(null) }
    window.addEventListener("scroll", onTop, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onTop)
    }
  }, [home])

  // Old one-page anchor: #team used to mean the subteams.
  useEffect(() => {
    if (home && window.location.hash === "#team") scrollToSection("subteams")
  }, [home])

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open)
  }, [open])

  const go = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false)
    if (home && scrollToSection(id)) event.preventDefault()
  }

  return (
    <header
      className="site-header"
      data-scrolled={scrolled || open ? "" : undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false)
          toggle.current?.focus()
        }
      }}
    >
      <div className="header-bar">
        <Link href="/" className="brand" aria-label="Longhorn Baja Racing home" onClick={(e) => { setOpen(false); if (home) { e.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); history.replaceState(null, "", window.location.pathname) } }}>
          <Image src={asset("/lbr-logo.png")} alt="" width={36} height={36} priority />
          <span className="brand-text">
            <span className="brand-name">Longhorn Baja Racing</span>
            <span className="brand-sub">UT Austin / Baja SAE</span>
          </span>
        </Link>
        <nav id="site-navigation" aria-label="Main navigation" className="site-nav" data-open={open ? "" : undefined}>
          <ul>
            {sections.map((s, i) => (
              <li key={s.id} style={{ "--i": i } as CSSProperties}>
                <Link href={`/#${s.id}`} prefetch={false} onClick={go(s.id)} aria-current={home && current === s.id ? "true" : undefined}>
                  <span className="nav-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          <a className="nav-cta" href={siteConfig.applyUrl} target="_blank" rel="noopener noreferrer">
            Apply now <Arrow />
          </a>
        </nav>
        <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
          <span className="menu-toggle-label">{open ? "Close" : "Menu"}</span>
          <span className="menu-toggle-icon" aria-hidden="true" />
        </button>
      </div>
      <SeasonalDecor active={season} />
    </header>
  )
}

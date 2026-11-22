"use client"

import { useEffect, useState } from "react"
import { scrollToSection } from "@/components/site/scroll"

/** Sticky subteam index beside the 3D car: shows where you are and jumps on press. */
export default function MachineIndex({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: "-45% 0px -45% 0px" },
    )
    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [items])

  return (
    <nav className="machine-index" aria-label="Subteams">
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={active === item.id ? "step" : undefined} onClick={(e) => { if (scrollToSection(item.id)) e.preventDefault() }}>
              <span className="machine-index-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="machine-index-name">{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

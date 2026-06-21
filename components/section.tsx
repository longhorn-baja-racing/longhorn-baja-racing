import type { ReactNode } from "react"

interface SectionProps {
  label?: string
  title: string
  anchor?: string
  children: ReactNode
}

export default function Section({ label, title, anchor, children }: SectionProps) {
  return (
      <section className="site-section px-6 py-20 md:py-28" id={anchor}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16">
            <div className="w-fit">
              {label && <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-primary">{label}</p>}
              <h2 className="text-4xl font-black uppercase tracking-[-0.04em] text-white md:text-5xl">{title}</h2>
            </div>
          </div>
          {children}
        </div>
      </section>
  )
}

export { Section }

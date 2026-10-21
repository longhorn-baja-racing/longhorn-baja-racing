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
              {label && <p className="eyebrow mb-4">{label}</p>}
              <h1 className="text-6xl uppercase text-white md:text-8xl">{title}</h1>
            </div>
          </div>
          {children}
        </div>
      </section>
  )
}

export { Section }

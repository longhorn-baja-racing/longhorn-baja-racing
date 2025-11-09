import type { ReactNode } from "react"

interface SectionProps {
  label?: string
  title: string
  anchor?: string
  children: ReactNode
}

export default function Section({ label, title, anchor, children }: SectionProps) {
  return (
      <section className="bg-background py-20 px-6" id={anchor}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="w-fit">
              <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
              {label && <p className="text-xs font-semibold text-primary mt-2 uppercase tracking-wide">{label}</p>}
            </div>
          </div>
          {children}
        </div>
      </section>
  )
}

export { Section }

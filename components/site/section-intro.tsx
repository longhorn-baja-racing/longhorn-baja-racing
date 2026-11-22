import type { ReactNode } from "react"

type Props = {
  index: string
  label: string
  id: string
  title: ReactNode
  lede?: ReactNode
  /** Heading level: h2 on the home page, h1 on standalone pages. */
  as?: "h1" | "h2"
  children?: ReactNode
}

/** Numbered eyebrow, display heading, and optional lede shared by every section. */
export default function SectionIntro({ index, label, id, title, lede, as: Tag = "h2", children }: Props) {
  return (
    <header className="section-intro">
      <p className="eyebrow">
        <span className="eyebrow-index">{index}</span>
        <span className="eyebrow-rule" aria-hidden="true" />
        {label}
      </p>
      <Tag id={id} className="section-title">{title}</Tag>
      {lede && <p className="section-lede">{lede}</p>}
      {children}
    </header>
  )
}

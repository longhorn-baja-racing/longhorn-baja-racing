/** Small arrow icon for links and buttons. Decorative: the link text carries the meaning. */
export default function Arrow({ direction = "right" }: { direction?: "right" | "left" | "up-right" }) {
  const rotate = direction === "left" ? 180 : direction === "up-right" ? -45 : 0
  return (
    <svg className="arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}>
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  )
}

export type SubteamSymbolKind =
  | "powertrain"
  | "dynamics"
  | "chassis"
  | "ergonomics"
  | "electronics"
  | "software"
  | "public-relations"
  | "business"
  | "corporate-relations"
  | "logistics"

interface SubteamSymbolProps {
  kind: SubteamSymbolKind
  title: string
  className?: string
}

function Glyph({ kind }: { kind: SubteamSymbolKind }) {
  switch (kind) {
    case "powertrain":
      return (
        <>
          <circle cx="23" cy="34" r="11" />
          <circle cx="23" cy="34" r="3.5" />
          <circle cx="45" cy="25" r="7" />
          <circle cx="45" cy="25" r="2.5" />
          <path d="M23 17v6M23 45v6M6 34h6M34 34h6M11 22l5 5M30 41l5 5M11 46l5-5M30 27l5-5M45 13v5M45 32v5M33 25h5M52 25h5" />
        </>
      )
    case "dynamics":
      return (
        <>
          <path d="M10 14h28M13 14v36M13 24l31 6M13 50l31-14" />
          <path d="m26 17 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4" />
          <circle cx="47" cy="33" r="11" />
          <circle cx="47" cy="33" r="4" />
        </>
      )
    case "chassis":
      return (
        <>
          <circle cx="13" cy="47" r="6" />
          <circle cx="51" cy="47" r="6" />
          <path d="M7 46h9l8-8h22l7 8h5M16 46l6-21h20l8 21M22 25l12 13M42 25l-8 13M24 38h22M27 25l3-8h8l4 8M30 17l12 8" />
        </>
      )
    case "ergonomics":
      return (
        <>
          <path d="M15 12v25c0 8 6 14 14 14h13M24 13c-3 8-3 16 1 23l7 11M15 37h15l7 14" />
          <path d="M18 17l12 25M29 17 18 42" />
          <circle cx="46" cy="25" r="7" />
          <path d="M39 25h14M46 18v14M32 34l8-5M44 48h12M47 44v4M53 42v6" />
        </>
      )
    case "electronics":
      return (
        <>
          <rect x="18" y="17" width="28" height="28" rx="4" />
          <rect x="25" y="24" width="14" height="14" rx="2" />
          <path d="M24 17v-6M32 17v-6M40 17v-6M24 45v6M32 45v6M40 45v6M18 23h-6M18 31h-6M18 39h-6M46 23h6M46 31h6M46 39h6" />
        </>
      )
    case "software":
      return (
        <>
          <rect x="8" y="12" width="48" height="34" rx="5" />
          <path d="M13 35h7l4-12 7 19 7-15 5 8h8M13 18h15M44 18h7M27 46v6M20 52h24" />
        </>
      )
    case "public-relations":
      return (
        <>
          <rect x="8" y="20" width="38" height="28" rx="5" />
          <path d="m16 20 4-7h13l4 7" />
          <circle cx="27" cy="34" r="8" />
          <circle cx="40" cy="26" r="1" />
          <path d="M50 25c5 4 5 13 0 17M54 20c9 7 9 20 0 27" />
        </>
      )
    case "business":
      return (
        <>
          <rect x="8" y="18" width="48" height="32" rx="5" />
          <path d="M23 18v-6h18v6M16 41v-9M25 41V27M34 41v-6M43 41V23M15 27l10-6 9 4 11-8 6 3" />
        </>
      )
    case "corporate-relations":
      return (
        <>
          <path d="m25 39-5 5a9 9 0 0 1-13-13l7-7a9 9 0 0 1 13 0l2 2" />
          <path d="m39 25 5-5a9 9 0 0 1 13 13l-7 7a9 9 0 0 1-13 0l-2-2" />
          <path d="m23 41 18-18" />
        </>
      )
    case "logistics":
      return (
        <>
          <rect x="6" y="20" width="34" height="24" rx="2" />
          <path d="M40 27h9l8 8v9H40zM49 27v8h8M12 20v-7h11v13H12zM25 16h10v10H25z" />
          <circle cx="16" cy="47" r="4" />
          <circle cx="48" cy="47" r="4" />
        </>
      )
  }
}

export default function SubteamSymbol({ kind, title, className }: SubteamSymbolProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-labelledby={`${kind}-symbol-title`}
    >
      <title id={`${kind}-symbol-title`}>{`${title} symbol`}</title>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Glyph kind={kind} />
      </g>
    </svg>
  )
}

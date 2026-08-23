export type SubteamDiagramKind =
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

interface SubteamDiagramProps {
  kind: SubteamDiagramKind
  title: string
}

function Diagram({ kind }: { kind: SubteamDiagramKind }) {
  switch (kind) {
    case "powertrain":
      return (
        <>
          <circle cx="220" cy="190" r="70" />
          <circle cx="220" cy="190" r="20" className="accent" />
          <circle cx="430" cy="190" r="49" />
          <circle cx="430" cy="190" r="14" className="accent" />
          <path d="M220 120c83 0 142 7 210 21M220 260c83 0 142-7 210-21" />
          <path d="M220 101v19M220 260v19M131 190h19M290 190h19M157 127l14 14M269 239l14 14M157 253l14-14M269 141l14-14" className="muted" />
          <path d="m326 126 24 17-27 13" className="accent" />
        </>
      )
    case "dynamics":
      return (
        <>
          <path d="M133 112h205M153 112v162" className="muted" />
          <circle cx="432" cy="202" r="78" />
          <circle cx="432" cy="202" r="31" />
          <circle cx="432" cy="202" r="8" className="accent-fill" />
          <path d="m153 155 239 31M153 274l239-55" />
          <path d="m244 124 17 15-17 15 17 15-17 15 17 15-17 15 17 15-17 15 17 15-17 15" className="accent" />
          <path d="M244 124h-25M261 274h-42" />
          <path d="M403 177c-19 13-21 43-4 57" className="accent" />
        </>
      )
    case "chassis":
      return (
        <>
          <circle cx="154" cy="250" r="43" className="muted" />
          <circle cx="486" cy="250" r="43" className="muted" />
          <path d="M113 248h67l58-48h191l56 48h51" />
          <path d="M180 248 222 118h170l66 130M222 118l106 82M392 118l-64 82M238 200h191" />
          <path d="m252 118 25-48h77l38 48M277 70l115 48" className="accent" />
        </>
      )
    case "ergonomics":
      return (
        <>
          <path d="M196 91v128c0 50 40 90 90 90h120" />
          <path d="M268 95c-18 44-18 87 5 127l46 62M196 225h95l46 84" className="muted" />
          <path d="M220 119 308 262M300 119l-80 143" className="accent" />
          <circle cx="429" cy="161" r="44" />
          <circle cx="429" cy="161" r="7" className="accent-fill" />
          <path d="M385 161h88M429 117v88M319 210l68-32" />
          <path d="M430 291h91M447 264v27M495 250v41" className="muted" />
        </>
      )
    case "electronics":
      return (
        <>
          <rect x="223" y="91" width="194" height="190" rx="24" />
          <rect x="272" y="140" width="96" height="92" rx="14" className="accent" />
          <path d="M253 91V57M298 91V57M343 91V57M388 91V57M253 281v34M298 281v34M343 281v34M388 281v34M223 121h-34M223 166h-34M223 211h-34M223 256h-34M417 121h34M417 166h34M417 211h34M417 256h34" />
          <circle cx="174" cy="121" r="9" className="accent-fill" />
          <circle cx="466" cy="211" r="9" className="accent-fill" />
        </>
      )
    case "software":
      return (
        <>
          <rect x="104" y="73" width="432" height="230" rx="24" />
          <path d="M140 212h50l27-65 45 115 45-92 39 42h154" className="accent" />
          <path d="M140 116h126M391 116h109M140 271h360" className="muted" />
          <path d="M270 303v39M208 342h124M370 342h62" />
          <circle cx="477" cy="116" r="7" className="accent-fill" />
        </>
      )
    case "public-relations":
      return (
        <>
          <rect x="100" y="129" width="314" height="178" rx="22" />
          <path d="m158 129 29-49h102l29 49" />
          <circle cx="257" cy="218" r="60" className="accent" />
          <circle cx="257" cy="218" r="23" />
          <circle cx="377" cy="163" r="8" className="accent-fill" />
          <path d="M449 163c36 29 36 81 0 110M484 129c60 49 60 129 0 178" className="accent" />
        </>
      )
    case "business":
      return (
        <>
          <rect x="117" y="106" width="406" height="220" rx="24" />
          <path d="M243 106V75h154v31" />
          <path d="M183 266v-55M246 266v-92M309 266v-45M372 266v-118" className="muted" />
          <path d="m172 179 73-41 64 25 81-54 68 19" className="accent" />
          <path d="m431 103 27 25-34 15" className="accent" />
        </>
      )
    case "corporate-relations":
      return (
        <>
          <rect x="138" y="143" width="258" height="96" rx="48" transform="rotate(-32 267 191)" />
          <rect x="244" y="143" width="258" height="96" rx="48" transform="rotate(32 373 191)" className="accent" />
          <path d="M273 192h94" className="muted" />
          <circle cx="320" cy="192" r="10" className="accent-fill" />
        </>
      )
    case "logistics":
      return (
        <>
          <path d="M91 139h311v150H91z" />
          <path d="M402 190h82l65 62v37H402zM484 190v62h65" />
          <rect x="121" y="103" width="92" height="94" rx="10" className="muted" />
          <rect x="227" y="79" width="104" height="118" rx="10" />
          <rect x="345" y="116" width="87" height="81" rx="10" className="muted" />
          <circle cx="171" cy="301" r="28" />
          <circle cx="463" cy="301" r="28" />
          <path d="M91 337h458" className="muted" />
          <path d="M426 89h104M503 66l27 23-27 23" className="accent" />
        </>
      )
  }
}

export default function SubteamDiagram({ kind, title }: SubteamDiagramProps) {
  return (
    <svg
      viewBox="0 0 640 400"
      className="h-full w-full"
      role="img"
      aria-labelledby={`${kind}-diagram-title`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id={`${kind}-diagram-title`}>{`${title} symbol`}</title>
      <rect width="640" height="400" fill="#121416" />
      <circle cx="320" cy="186" r="166" fill="#ffffff" opacity="0.018" />
      <g
        fill="none"
        stroke="#e9e5dc"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[&_.accent-fill]:fill-primary [&_.accent-fill]:stroke-none [&_.accent]:stroke-primary [&_.muted]:stroke-white/25"
      >
        <Diagram kind={kind} />
      </g>
    </svg>
  )
}

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
          <circle cx="202" cy="186" r="70" />
          <circle cx="202" cy="186" r="18" className="accent-fill" />
          <circle cx="390" cy="186" r="48" />
          <circle cx="390" cy="186" r="12" className="accent-fill" />
          <path d="M202 116C278 116 326 126 390 138M202 256C278 256 326 246 390 234" />
          <circle cx="500" cy="270" r="42" />
          <path d="M390 234 468 249M390 138l98 91" className="accent" />
          <path d="M542 270h56M500 228v84" className="detail" />
        </>
      )
    case "dynamics":
      return (
        <>
          <path d="M96 318h448" className="detail" />
          <circle cx="424" cy="230" r="78" />
          <circle cx="424" cy="230" r="28" className="accent" />
          <path d="m160 154 218 50M160 296l218-42M160 154v142" />
          <path d="m248 128 18 18-18 18 18 18-18 18 18 18-18 18 18 18-18 18 18 18" className="accent" />
          <path d="M248 128h-36M266 290h-54M424 152v156" className="detail" />
        </>
      )
    case "chassis":
      return (
        <>
          <path d="M104 302 160 124h190l112 178H104Z" />
          <path d="M160 124 274 302M350 124 268 302M104 302l104-72h210l44 72" />
          <path d="M208 230 248 82h86l84 148M248 82l102 42M334 82l-174 42" className="accent" />
          <path d="M92 324h408M462 302l80 22" className="detail" />
        </>
      )
    case "ergonomics":
      return (
        <>
          <path d="M204 112c-24 48-18 92 18 132l-38 62h176l-28-66c-20-46-18-86 8-128Z" />
          <path d="m218 134 98 114M326 134 228 248" className="accent" />
          <circle cx="442" cy="154" r="48" />
          <circle cx="442" cy="154" r="8" className="accent-fill" />
          <path d="M442 106v96M394 154h96M408 302h64M414 270h22v32M456 254h22v48" />
          <path d="M360 222 414 188" className="detail" />
        </>
      )
    case "electronics":
      return (
        <>
          <rect x="224" y="104" width="192" height="190" rx="10" />
          <rect x="274" y="150" width="92" height="74" rx="4" className="accent" />
          <path d="M224 140h-68l-36-36M224 188h-92M224 246h-68l-36 38M416 140h68l36-36M416 188h92M416 246h68l36 38" />
          <circle cx="108" cy="92" r="15" className="accent-fill" />
          <circle cx="116" cy="188" r="15" />
          <circle cx="108" cy="296" r="15" className="accent-fill" />
          <circle cx="532" cy="92" r="15" />
          <circle cx="524" cy="188" r="15" className="accent-fill" />
          <circle cx="532" cy="296" r="15" />
          <path d="M260 104V76M308 104V76M356 104V76M404 104V76M260 294v28M308 294v28M356 294v28M404 294v28" className="detail" />
        </>
      )
    case "software":
      return (
        <>
          <rect x="106" y="82" width="350" height="220" rx="10" />
          <path d="M136 184h42l22-48 38 102 34-70 32 16h120" className="accent" />
          <path d="M136 122h110M136 268h78M280 268h144M282 122h142" className="detail" />
          <path d="M282 302v38M210 340h144" />
          <rect x="492" y="136" width="70" height="116" rx="8" />
          <circle cx="527" cy="168" r="10" className="accent-fill" />
          <circle cx="527" cy="220" r="10" />
          <path d="M456 194h36" className="accent" />
        </>
      )
    case "public-relations":
      return (
        <>
          <path d="M118 160h244v142H118z" />
          <path d="m176 160 28-52h88l28 52" />
          <circle cx="240" cy="230" r="48" className="accent" />
          <circle cx="240" cy="230" r="18" />
          <path d="M362 198 450 154v154l-88-44Z" />
          <path d="M474 178c34 28 34 76 0 104M506 146c58 48 58 120 0 168" className="accent" />
          <path d="M98 326h438" className="detail" />
        </>
      )
    case "business":
      return (
        <>
          <path d="M132 100h250v232H132z" />
          <path d="M212 100V76h90v24" className="accent" />
          <path d="m168 156 14 14 28-32M168 224l14 14 28-32M168 290l14 14 28-32" className="accent" />
          <path d="M238 156h102M238 224h102M238 290h102" />
          <rect x="430" y="132" width="94" height="172" rx="6" />
          <path d="M450 158h54M450 202h12M477 202h12M504 202h1M450 234h12M477 234h12M504 234h1M450 266h12M477 266h12M504 266h1" className="detail" />
        </>
      )
    case "corporate-relations":
      return (
        <>
          <path d="M116 92h248v240H116z" />
          <path d="M310 92v58h54" />
          <path d="M154 154h112M154 198h172M154 242h138M154 286h86" className="detail" />
          <circle cx="474" cy="198" r="54" />
          <circle cx="526" cy="250" r="54" className="accent" />
          <path d="M364 250h78M488 144l-42-42M564 288l34 34" />
        </>
      )
    case "logistics":
      return (
        <>
          <rect x="96" y="174" width="250" height="142" rx="8" />
          <path d="M96 220h250M170 174v142M272 174v142" />
          <path d="M168 174v-40h106v40" className="accent" />
          <circle cx="142" cy="334" r="18" />
          <circle cx="302" cy="334" r="18" />
          <path d="M402 292c0-104 60-164 140-164" className="detail" />
          <circle cx="402" cy="292" r="14" className="accent-fill" />
          <circle cx="468" cy="196" r="14" />
          <circle cx="542" cy="128" r="14" className="accent-fill" />
          <path d="m510 124 32-28 32 28" className="accent" />
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
      <title id={`${kind}-diagram-title`}>{`${title} technical diagram`}</title>
      <rect width="640" height="400" fill="#121416" />
      <g stroke="#ffffff" strokeWidth="1" opacity="0.06">
        {[80, 160, 240, 320, 400, 480, 560].map((x) => <path key={`x-${x}`} d={`M${x} 0v400`} />)}
        {[80, 160, 240, 320].map((y) => <path key={`y-${y}`} d={`M0 ${y}h640`} />)}
      </g>
      <g
        fill="none"
        stroke="#e9e5dc"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[&_.accent-fill]:fill-primary [&_.accent-fill]:stroke-none [&_.accent]:stroke-primary [&_.detail]:stroke-white/35"
      >
        <Diagram kind={kind} />
      </g>
      <g fill="#bf5700">
        <circle cx="48" cy="48" r="6" />
        <rect x="68" y="44" width="82" height="8" />
      </g>
      <path d="M492 350h100" stroke="#ffffff" strokeWidth="2" opacity="0.22" />
      <path d="M566 338l26 12-26 12" fill="none" stroke="#bf5700" strokeWidth="4" />
    </svg>
  )
}

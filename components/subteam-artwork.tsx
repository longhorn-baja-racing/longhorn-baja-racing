import type { ReactNode } from "react"

type SubteamArtworkProps = {
  id: string
}

const WHITE = "#F5F1EB"
const MUTED = "#78838E"
const ORANGE = "#BF5700"
const ORANGE_BRIGHT = "#F17922"

const metadata: Record<string, { index: string; title: string; labels: string[] }> = {
  powertrain: { index: "01", title: "POWERTRAIN", labels: ["CVT", "CHAIN", "GEARING", "TORQUE"] },
  dynamics: { index: "02", title: "DYNAMICS", labels: ["SUSPENSION", "STEERING", "BRAKES", "GRIP"] },
  chassis: { index: "03", title: "CHASSIS", labels: ["FRAME", "SAFETY", "RIGIDITY", "WEIGHT"] },
  ergonomics: { index: "04", title: "ERGONOMICS", labels: ["DRIVER", "HARNESS", "CONTROLS", "SAFETY"] },
  electronics: { index: "05", title: "ELECTRONICS", labels: ["SENSORS", "CAN", "POWER", "DATA"] },
  software: { index: "06", title: "SOFTWARE", labels: ["TELEMETRY", "SIMULATION", "ANALYSIS", "WEB"] },
  "public-relations": { index: "07", title: "PUBLIC RELATIONS", labels: ["MEDIA", "STORY", "SOCIAL", "BRAND"] },
  business: { index: "08", title: "BUSINESS", labels: ["RULES", "FINANCE", "OPS", "COMPLIANCE"] },
  "corporate-relations": { index: "09", title: "CORPORATE RELATIONS", labels: ["SPONSORS", "OUTREACH", "VALUE", "PARTNERS"] },
  logistics: { index: "10", title: "LOGISTICS", labels: ["TRAVEL", "STORAGE", "EVENTS", "INVENTORY"] },
}

const line = {
  fill: "none",
  stroke: WHITE,
  strokeWidth: 8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const thin = {
  fill: "none",
  stroke: MUTED,
  strokeWidth: 4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const accent = {
  fill: "none",
  stroke: ORANGE_BRIGHT,
  strokeWidth: 8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const accentThin = {
  ...accent,
  strokeWidth: 4,
}

function PowertrainArtwork() {
  return (
    <g transform="translate(205 168)">
      <circle cx="220" cy="220" r="132" {...thin} />
      <circle cx="220" cy="220" r="92" {...line} />
      <circle cx="220" cy="220" r="27" fill={ORANGE} />
      <circle cx="600" cy="220" r="100" {...thin} />
      <circle cx="600" cy="220" r="64" {...line} />
      <circle cx="600" cy="220" r="23" fill={ORANGE} />
      <path d="M220 92c104-28 260-24 380 28M220 348c112 29 264 22 380-28" {...accent} />
      <path d="M102 220H50M338 220h76M500 220h-56M700 220h80" {...thin} />
      <path d="M220 128v184M128 220h184M600 156v128M536 220h128" {...thin} opacity="0.55" />
      <path d="M360 402h232l78-48" {...line} />
      <path d="M378 432h160" {...accentThin} />
      <TechnicalText x={345} y={54}>CVT / FINAL DRIVE</TechnicalText>
    </g>
  )
}

function DynamicsArtwork() {
  return (
    <g transform="translate(190 156)">
      <circle cx="660" cy="300" r="132" {...line} />
      <circle cx="660" cy="300" r="58" {...thin} />
      <path d="M610 168l-118-94M714 174l88-96M594 412l-102 82M724 412l86 76" {...line} />
      <path d="M460 94l-92 102 72 34-72 34 72 34-72 34 72 34-72 34 82 92" {...accent} />
      <path d="M455 80l58 28M446 496l58-28" {...thin} />
      <path d="M660 242v116M602 300h116" {...thin} opacity="0.55" />
      <path d="M84 446h210l72-56" {...line} />
      <path d="M110 410l64-190h150" {...thin} />
      <path d="M158 222h116" {...accentThin} />
      <TechnicalText x={68} y={60}>SUSPENSION / STEERING / BRAKING</TechnicalText>
    </g>
  )
}

function ChassisArtwork() {
  return (
    <g transform="translate(145 170)">
      <path d="M96 414L182 142l178-64 252 42 142 164-70 154H210z" {...line} />
      <path d="M182 142l160 272M360 78l-18 336M612 120L342 414M612 120l72 318M754 284H96M182 142l430-22" {...thin} />
      <path d="M244 170h218l78 84H226z" {...accent} />
      <circle cx="190" cy="438" r="46" {...thin} />
      <circle cx="682" cy="438" r="46" {...thin} />
      <path d="M72 486h730" {...accentThin} />
      <TechnicalText x={536} y={62}>TUBULAR SPACE FRAME</TechnicalText>
    </g>
  )
}

function ErgonomicsArtwork() {
  return (
    <g transform="translate(225 150)">
      <path d="M292 72c-52 48-80 112-82 190l-34 214h286l-24-152c-8-53-8-102 2-150l18-86z" {...line} />
      <path d="M232 190h188M210 268h218M192 356h254" {...thin} />
      <path d="M252 120l118 294M408 126L286 414" {...accent} />
      <circle cx="524" cy="150" r="68" {...line} />
      <path d="M524 82v136M456 150h136" {...thin} />
      <path d="M566 350h152v110H566z" {...line} />
      <path d="M584 368h42v74h-42zM650 368h42v74h-42z" {...accentThin} />
      <path d="M460 452h320" {...thin} />
      <TechnicalText x={490} y={62}>SEAT / HARNESS / CONTROLS</TechnicalText>
    </g>
  )
}

function ElectronicsArtwork() {
  return (
    <g transform="translate(185 165)">
      <rect x="92" y="68" width="680" height="382" rx="12" {...line} />
      <rect x="158" y="126" width="190" height="120" rx="8" {...accent} />
      <path d="M178 214l34-48 34 48 38-66 42 66" {...thin} />
      <circle cx="494" cy="166" r="42" {...line} />
      <circle cx="640" cy="166" r="42" {...line} />
      <circle cx="494" cy="330" r="42" {...line} />
      <circle cx="640" cy="330" r="42" {...line} />
      <path d="M348 186h104M536 166h62M682 166h58M348 332h104M536 330h62M682 330h58" {...thin} />
      <path d="M494 208v80M640 208v80M118 300h230M118 366h230" {...accentThin} />
      <circle cx="118" cy="300" r="9" fill={ORANGE_BRIGHT} />
      <circle cx="118" cy="366" r="9" fill={ORANGE_BRIGHT} />
      <path d="M92 110H44M92 180H44M92 250H44M92 320H44M92 390H44M772 110h48M772 180h48M772 250h48M772 320h48M772 390h48" {...thin} />
      <TechnicalText x={478} y={42}>SENSORS / CAN / POWER</TechnicalText>
    </g>
  )
}

function SoftwareArtwork() {
  return (
    <g transform="translate(168 160)">
      <rect x="74" y="74" width="700" height="390" rx="10" {...line} />
      <path d="M74 136h700" {...thin} />
      <circle cx="112" cy="105" r="8" fill={ORANGE_BRIGHT} />
      <circle cx="140" cy="105" r="8" fill={MUTED} />
      <circle cx="168" cy="105" r="8" fill={MUTED} />
      <path d="M124 236l38-36 38 30 52-76 54 100 58-52 54 18 66-76 62 110 54-34 68 18" {...accent} />
      <path d="M124 292h520M124 344h520M124 396h300" {...thin} opacity="0.55" />
      <path d="M528 168h178v208H528z" fill="none" stroke={WHITE} strokeWidth="4" opacity="0.45" />
      <path d="M556 336l30-78 62-20 36 98zM586 258l-14-48 60-20 16 48" {...line} />
      <circle cx="574" cy="344" r="20" {...accentThin} />
      <circle cx="674" cy="344" r="20" {...accentThin} />
      <TechnicalText x={526} y={126}>DIGITAL TWIN</TechnicalText>
      <TechnicalText x={94} y={46}>TELEMETRY / ANALYSIS / SIMULATION</TechnicalText>
    </g>
  )
}

function PublicRelationsArtwork() {
  return (
    <g transform="translate(180 156)">
      <rect x="78" y="88" width="520" height="332" rx="12" {...line} />
      <circle cx="338" cy="254" r="98" {...accent} />
      <circle cx="338" cy="254" r="38" {...thin} />
      <path d="M124 120h110l24 36h160l24-36h108" {...thin} />
      <path d="M620 128h170v118H620zM620 270h170v118H620z" {...line} />
      <path d="M650 162h110M650 194h76M650 304h110M650 336h86" {...accentThin} />
      <path d="M92 456h692" {...thin} />
      <path d="M214 484h448" {...accentThin} />
      <path d="M112 60h192M474 60h284" {...thin} />
      <TechnicalText x={105} y={46}>PHOTO / STORY / COMMUNITY</TechnicalText>
    </g>
  )
}

function BusinessArtwork() {
  return (
    <g transform="translate(190 150)">
      <path d="M96 74h374v402H96z" {...line} />
      <path d="M150 142h258M150 206h168M150 270h258M150 334h190" {...thin} />
      <path d="M150 398l34 34 74-90" {...accent} />
      <path d="M540 120h226v316H540z" {...line} />
      <path d="M586 178h134M586 232h134M586 286h134" {...thin} />
      <path d="M578 394h154M604 360v34M648 332v62M692 300v94" {...accent} />
      <circle cx="710" cy="88" r="48" {...accentThin} />
      <path d="M688 88l16 16 30-38" {...line} />
      <TechnicalText x={94} y={42}>RULES / FINANCE / OPERATIONS</TechnicalText>
    </g>
  )
}

function CorporateRelationsArtwork() {
  return (
    <g transform="translate(180 158)">
      <path d="M180 132l112-64 112 64v128l-112 64-112-64z" {...line} />
      <path d="M484 132l112-64 112 64v128l-112 64-112-64z" {...line} />
      <path d="M404 196h80" {...accent} />
      <path d="M258 182h68M562 182h68" {...thin} />
      <circle cx="292" cy="224" r="18" fill={ORANGE} />
      <circle cx="596" cy="224" r="18" fill={ORANGE} />
      <path d="M292 324v92M596 324v92M292 416h304" {...thin} />
      <path d="M214 448h460" {...accentThin} />
      <path d="M112 478h662" {...thin} />
      <TechnicalText x={126} y={44}>PARTNERSHIPS / SPONSORSHIP / OUTREACH</TechnicalText>
    </g>
  )
}

function LogisticsArtwork() {
  return (
    <g transform="translate(150 162)">
      <path d="M90 320h410V162H90z" {...line} />
      <path d="M500 224h152l86 96v92H500z" {...line} />
      <path d="M540 258h86l48 54H540z" {...thin} />
      <circle cx="208" cy="414" r="54" {...accent} />
      <circle cx="618" cy="414" r="54" {...accent} />
      <path d="M112 198h170M112 242h118M112 286h194" {...thin} />
      <path d="M72 472h700" {...thin} />
      <path d="M330 92c90-52 170-54 246 0s126 58 196 10" {...accent} />
      <circle cx="330" cy="92" r="10" fill={WHITE} />
      <circle cx="576" cy="92" r="10" fill={WHITE} />
      <circle cx="772" cy="102" r="10" fill={WHITE} />
      <path d="M364 372h92" {...thin} />
      <TechnicalText x={90} y={52}>TRANSPORT / INVENTORY / EVENTS</TechnicalText>
    </g>
  )
}

function TechnicalText({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text x={x} y={y} fill={MUTED} fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="700" letterSpacing="3">
      {children}
    </text>
  )
}

function renderArtwork(id: string) {
  switch (id) {
    case "powertrain":
      return <PowertrainArtwork />
    case "dynamics":
      return <DynamicsArtwork />
    case "chassis":
      return <ChassisArtwork />
    case "ergonomics":
      return <ErgonomicsArtwork />
    case "electronics":
      return <ElectronicsArtwork />
    case "software":
      return <SoftwareArtwork />
    case "public-relations":
      return <PublicRelationsArtwork />
    case "business":
      return <BusinessArtwork />
    case "corporate-relations":
      return <CorporateRelationsArtwork />
    case "logistics":
      return <LogisticsArtwork />
    default:
      return null
  }
}

export default function SubteamArtwork({ id }: SubteamArtworkProps) {
  const item = metadata[id] ?? { index: "00", title: "SUBTEAM", labels: ["DESIGN", "BUILD", "TEST", "RACE"] }
  const gridLines = Array.from({ length: 24 }, (_, index) => 48 + index * 48)

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="h-full w-full"
    >
      <rect width="1200" height="800" fill="#0B0E11" />
      <g opacity="0.42" stroke="#28313A" strokeWidth="1">
        {gridLines.map((position) => (
          <g key={position}>
            <path d={`M${position} 0v800`} />
            <path d={`M0 ${position}h1200`} />
          </g>
        ))}
      </g>
      <path d="M0 0h420L120 800H0z" fill={ORANGE} opacity="0.16" />
      <path d="M0 1180L1200 -20" stroke={ORANGE} strokeWidth="2" opacity="0.28" />
      <path d="M960 0h240v800H820z" fill="#151A1F" opacity="0.52" />
      <rect x="52" y="52" width="1096" height="696" fill="none" stroke={WHITE} strokeWidth="2" opacity="0.18" />
      <path d="M52 132h1096" stroke={WHITE} strokeWidth="2" opacity="0.14" />
      <rect x="78" y="78" width="16" height="16" fill={ORANGE_BRIGHT} />
      <text x="112" y="96" fill={WHITE} fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="700" letterSpacing="4">
        LONGHORN BAJA / {item.title}
      </text>
      <text x="994" y="112" fill={WHITE} opacity="0.07" fontFamily="Arial, Helvetica, sans-serif" fontSize="104" fontWeight="900" letterSpacing="-6">
        {item.index}
      </text>

      {renderArtwork(id)}

      <path d="M78 674h1044" stroke={WHITE} strokeWidth="2" opacity="0.16" />
      {item.labels.map((label, index) => (
        <text
          key={label}
          x={78 + index * 205}
          y="705"
          fill={MUTED}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="15"
          fontWeight="700"
          letterSpacing="3"
        >
          {label}
        </text>
      ))}
      <text x="1070" y="710" fill={MUTED} fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="700" letterSpacing="3">
        LBR
      </text>
      <rect x="78" y="727" width="160" height="5" fill={ORANGE_BRIGHT} />
    </svg>
  )
}

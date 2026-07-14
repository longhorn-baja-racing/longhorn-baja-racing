type SubteamIllustrationProps = {
  type: "electronics" | "software" | "public-relations" | "business" | "corporate-relations" | "logistics"
}

const bg = "#111315"
const panel = "#202428"
const line = "#F3EFE8"
const muted = "#747B82"
const orange = "#BF5700"
const orangeBright = "#E66C00"

function Wheel({ x, y, r = 56 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#0A0B0C" stroke={line} strokeWidth="10" />
      <circle cx={x} cy={y} r={r - 22} fill="none" stroke={muted} strokeWidth="7" />
      <circle cx={x} cy={y} r="9" fill={orangeBright} />
    </g>
  )
}

function BajaCar({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Wheel x={90} y={190} r={48} />
      <Wheel x={330} y={190} r={48} />
      <path d="M78 157L130 70h116l70 87" fill="none" stroke={line} strokeWidth="12" strokeLinejoin="round" />
      <path d="M131 70l58 87m57-87-57 87M78 157h238" fill="none" stroke={muted} strokeWidth="8" />
      <path d="M145 96h89l34 61H111z" fill={panel} stroke={line} strokeWidth="8" />
      <path d="M101 160l-38 14m242-14 43 14" stroke={orangeBright} strokeWidth="10" strokeLinecap="round" />
      <rect x="168" y="116" width="43" height="24" rx="4" fill={orange} />
    </g>
  )
}

function Electronics() {
  return (
    <>
      <path d="M84 650V126h1000v524" fill="none" stroke={muted} strokeWidth="8" />
      <path d="M140 650V190l180-64v524m740 0V190l-180-64v524" fill="none" stroke={line} strokeWidth="14" />
      <rect x="315" y="190" width="570" height="392" rx="18" fill={panel} stroke={line} strokeWidth="8" />
      <rect x="472" y="290" width="256" height="190" rx="14" fill="#121416" stroke={line} strokeWidth="9" />
      <path d="M504 430h192M504 398h192" stroke={muted} strokeWidth="8" />
      <rect x="346" y="290" width="82" height="190" rx="10" fill="#111315" stroke={line} strokeWidth="8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="367" y={315 + i * 31} width="40" height="17" rx="3" fill={i < 2 ? orangeBright : muted} />
      ))}
      <rect x="773" y="325" width="72" height="72" rx="36" fill={orangeBright} stroke={line} strokeWidth="8" />
      <path d="M809 325v72" stroke="#111315" strokeWidth="10" />
      <rect x="450" y="216" width="300" height="42" rx="8" fill="#7C1111" stroke={line} strokeWidth="7" />
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={486 + i * 46} cy="237" r="9" fill="#FF4A3D" />)}
      <path d="M428 334c38-42 40-79 76-79M428 380c70-34 83-96 122-124M728 342c52 0 56-63 81-90M728 393c60 4 71 47 81 79" fill="none" stroke={orangeBright} strokeWidth="9" strokeLinecap="round" />
      <path d="M600 480v64m-72-64v64m144-64v64" stroke={line} strokeWidth="9" />
      <circle cx="528" cy="558" r="13" fill={orangeBright} />
      <circle cx="600" cy="558" r="13" fill={orangeBright} />
      <circle cx="672" cy="558" r="13" fill={orangeBright} />
    </>
  )
}

function Software() {
  return (
    <>
      <rect x="104" y="164" width="646" height="392" rx="18" fill={panel} stroke={line} strokeWidth="10" />
      <rect x="139" y="201" width="576" height="316" rx="8" fill="#0A0C0D" stroke={muted} strokeWidth="5" />
      <path d="M104 556h646l68 86H42z" fill="#252A2E" stroke={line} strokeWidth="10" strokeLinejoin="round" />
      <path d="M186 420l72-54 70 24 80-92 82 46 80-106 94 50" fill="none" stroke={orangeBright} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M185 453h476M185 394h476M185 335h476M185 276h476" stroke={muted} strokeWidth="4" opacity="0.65" />
      <rect x="175" y="222" width="164" height="32" rx="5" fill={orange} opacity="0.85" />
      <BajaCar x={772} y={320} scale={0.82} />
      <path d="M746 496c48 24 69 54 92 95" fill="none" stroke={orangeBright} strokeWidth="8" strokeDasharray="14 13" />
      <rect x="831" y="591" width="104" height="42" rx="8" fill={panel} stroke={line} strokeWidth="7" />
      <circle cx="858" cy="612" r="8" fill={orangeBright} />
      <circle cx="883" cy="612" r="8" fill={muted} />
      <circle cx="908" cy="612" r="8" fill={muted} />
    </>
  )
}

function PublicRelations() {
  return (
    <>
      <rect x="70" y="490" width="1060" height="150" rx="12" fill={panel} stroke={muted} strokeWidth="6" />
      <path d="M140 300h312l58 70v190H82V370z" fill="#191C1F" stroke={line} strokeWidth="10" strokeLinejoin="round" />
      <rect x="207" y="250" width="116" height="58" rx="10" fill={panel} stroke={line} strokeWidth="8" />
      <circle cx="294" cy="423" r="93" fill="#0A0B0C" stroke={line} strokeWidth="12" />
      <circle cx="294" cy="423" r="53" fill={panel} stroke={orangeBright} strokeWidth="10" />
      <circle cx="294" cy="423" r="16" fill={orangeBright} />
      <rect x="574" y="233" width="230" height="312" rx="20" fill="#0A0B0C" stroke={line} strokeWidth="10" />
      <rect x="599" y="270" width="180" height="218" rx="8" fill={panel} />
      <BajaCar x={608} y={314} scale={0.44} />
      <rect x="666" y="505" width="46" height="10" rx="5" fill={muted} />
      <path d="M689 545v65m-72 0h144" stroke={line} strokeWidth="10" strokeLinecap="round" />
      <g transform="rotate(-5 940 420)">
        <rect x="842" y="290" width="222" height="160" rx="8" fill="#F0ECE4" stroke={line} strokeWidth="8" />
        <rect x="864" y="314" width="178" height="78" fill={panel} />
        <BajaCar x={879} y={306} scale={0.38} />
        <rect x="864" y="410" width="96" height="12" fill={orangeBright} />
        <rect x="970" y="410" width="72" height="12" fill={muted} />
      </g>
    </>
  )
}

function Business() {
  return (
    <>
      <rect x="70" y="490" width="1060" height="150" rx="12" fill={panel} stroke={muted} strokeWidth="6" />
      <rect x="92" y="180" width="320" height="386" rx="14" fill="#171A1D" stroke={line} strokeWidth="10" />
      <path d="M134 222h236v302H134z" fill={panel} stroke={muted} strokeWidth="6" />
      <BajaCar x={150} y={280} scale={0.55} />
      <path d="M150 472h190" stroke={orangeBright} strokeWidth="12" />
      <rect x="462" y="245" width="260" height="310" rx="12" fill="#EDE8DF" stroke={line} strokeWidth="8" />
      <path d="M516 245v-28h152v28" fill="none" stroke={line} strokeWidth="10" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x="494" y={294 + i * 38} width="18" height="18" fill={i < 4 ? orangeBright : "none"} stroke={muted} strokeWidth="4" />
          <path d={`M532 ${303 + i * 38}h144`} stroke={muted} strokeWidth="7" />
        </g>
      ))}
      <rect x="782" y="210" width="328" height="240" rx="14" fill="#121416" stroke={line} strokeWidth="10" />
      <rect x="814" y="244" width="264" height="172" rx="6" fill={panel} />
      <path d="M852 376V294m60 82V266m60 110V324m60 52V242" stroke={orangeBright} strokeWidth="24" />
      <rect x="812" y="488" width="166" height="126" rx="12" fill="#15181A" stroke={line} strokeWidth="8" />
      {[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => <rect key={`${row}-${col}`} x={837 + col * 34} y={515 + row * 30} width="22" height="18" rx="3" fill={row === 2 && col === 3 ? orangeBright : muted} />))}
    </>
  )
}

function CorporateRelations() {
  return (
    <>
      <rect x="70" y="490" width="1060" height="150" rx="12" fill={panel} stroke={muted} strokeWidth="6" />
      <rect x="98" y="185" width="312" height="390" rx="12" fill="#171A1D" stroke={line} strokeWidth="10" />
      <path d="M98 250h312" stroke={orangeBright} strokeWidth="28" />
      <BajaCar x={124} y={304} scale={0.62} />
      <path d="M142 507h222" stroke={muted} strokeWidth="10" />
      <rect x="470" y="220" width="430" height="278" rx="16" fill="#111315" stroke={line} strokeWidth="10" />
      <rect x="504" y="254" width="362" height="210" rx="8" fill={panel} />
      <BajaCar x={520} y={276} scale={0.47} />
      <circle cx="785" cy="329" r="42" fill="none" stroke={orangeBright} strokeWidth="18" strokeDasharray="86 180" />
      <path d="M750 405h90M750 430h58" stroke={muted} strokeWidth="9" />
      <path d="M470 498h430l55 75H415z" fill="#252A2E" stroke={line} strokeWidth="9" strokeLinejoin="round" />
      <rect x="955" y="244" width="145" height="248" rx="8" fill="#ECE7DE" stroke={line} strokeWidth="8" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x="981" y={278 + i * 49} width="93" height="25" rx="5" fill={i === 0 ? orangeBright : muted} />)}
      <g transform="translate(920 520)">
        <path d="M0 35c44-48 77-48 120 0M0 35c44 48 77 48 120 0" fill="none" stroke={line} strokeWidth="12" strokeLinecap="round" />
        <path d="M40 18l40 34" stroke={orangeBright} strokeWidth="12" strokeLinecap="round" />
      </g>
    </>
  )
}

function Logistics() {
  return (
    <>
      <rect x="74" y="138" width="1052" height="496" rx="16" fill="#171A1D" stroke={line} strokeWidth="12" />
      <path d="M838 138v496M74 634h1052" stroke={muted} strokeWidth="8" />
      <path d="M95 650h720l-92 104H182z" fill={panel} stroke={line} strokeWidth="10" />
      <BajaCar x={168} y={300} scale={1.35} />
      <path d="M272 570l-70 72m322-72 70 72" stroke={orangeBright} strokeWidth="12" />
      <rect x="880" y="188" width="190" height="100" rx="8" fill={panel} stroke={line} strokeWidth="7" />
      <rect x="880" y="310" width="190" height="100" rx="8" fill={panel} stroke={line} strokeWidth="7" />
      <rect x="880" y="432" width="190" height="100" rx="8" fill={panel} stroke={line} strokeWidth="7" />
      {[0, 1, 2].map((i) => <rect key={i} x="900" y={214 + i * 122} width="52" height="15" rx="4" fill={orangeBright} />)}
      <Wheel x={925} y={590} r={46} />
      <Wheel x={1030} y={590} r={46} />
      <rect x="730" y="194" width="80" height="202" rx="10" fill="#ECE7DE" stroke={line} strokeWidth="7" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="745" y={220 + i * 39} width="16" height="16" fill={orangeBright} />
          <path d={`M771 ${228 + i * 39}h22`} stroke={muted} strokeWidth="6" />
        </g>
      ))}
    </>
  )
}

export default function SubteamIllustration({ type }: SubteamIllustrationProps) {
  return (
    <svg viewBox="0 0 1200 800" className="h-full w-full" role="img" aria-label={`${type.replace("-", " ")} subteam work illustration`}>
      <rect width="1200" height="800" fill={bg} />
      <path d="M0 0h210L0 430z" fill={orange} opacity="0.28" />
      <path d="M0 742h1200" stroke={orangeBright} strokeWidth="7" />
      {type === "electronics" && <Electronics />}
      {type === "software" && <Software />}
      {type === "public-relations" && <PublicRelations />}
      {type === "business" && <Business />}
      {type === "corporate-relations" && <CorporateRelations />}
      {type === "logistics" && <Logistics />}
    </svg>
  )
}

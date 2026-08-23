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
          <path d="M82 196h34l22-40h96l28 40h26v104H82Z" />
          <path d="M110 156v-26h76M234 170l28-34h34" className="detail" />
          <circle cx="170" cy="246" r="31" className="accent" />
          <circle cx="170" cy="246" r="9" />
          <circle cx="368" cy="246" r="43" className="accent" />
          <circle cx="368" cy="246" r="12" />
          <circle cx="510" cy="246" r="73" />
          <circle cx="510" cy="246" r="28" />
          <path d="M201 246h124M411 225l71-8M411 267l71 8" />
          <path d="m296 228 30 18-30 18" className="accent" />
          <text x="113" y="123" className="label">ENGINE</text>
        </>
      )
    case "dynamics":
      return (
        <>
          <path d="M82 326h476" className="detail" />
          <path d="M112 132h218M136 132v168" />
          <circle cx="448" cy="242" r="82" />
          <circle cx="448" cy="242" r="35" className="accent" />
          <circle cx="448" cy="242" r="10" />
          <path d="m136 176 270 43M136 300l270-37" />
          <path d="m248 150 18 16-18 16 18 16-18 16 18 16-18 16 18 16-18 16 18 16" className="accent" />
          <path d="M248 150h-26M266 294h-44" />
          <path d="M414 208c-25 7-31 50-8 65" className="accent" />
          <text x="184" y="118" className="label">SPRING</text>
        </>
      )
    case "chassis":
      return (
        <>
          <circle cx="142" cy="294" r="54" className="detail" />
          <circle cx="500" cy="294" r="54" className="detail" />
          <path d="M112 292h60l70-55h205l54 55h40" />
          <path d="M174 292 220 138h176l72 154M220 138l118 99M396 138l-58 99M242 237h205" />
          <path d="M260 138 286 84h76l34 54M286 84l110 54" className="accent" />
          <path d="M174 292h294M92 350h468" className="detail" />
          <text x="260" y="68" className="label">ROLL CAGE</text>
        </>
      )
    case "ergonomics":
      return (
        <>
          <path d="M170 112v178c0 25 20 44 44 44h145" />
          <path d="M170 256h126l42 78" className="detail" />
          <circle cx="276" cy="118" r="34" />
          <path d="M274 154c-28 36-32 76-10 111l64 20M270 184l82 36M264 265l82 48" />
          <circle cx="384" cy="206" r="39" />
          <circle cx="384" cy="206" r="8" className="accent-fill" />
          <path d="M350 220h-40M270 172l64 98M332 170l-62 100" className="accent" />
          <path d="M418 334h104M438 300h24v34M494 282h24v52" />
          <text x="103" y="104" className="label">SEAT</text>
        </>
      )
    case "electronics":
      return (
        <>
          <rect x="244" y="124" width="152" height="150" rx="10" className="accent" />
          <text x="282" y="210" className="label label-large">ECU</text>
          <rect x="72" y="90" width="120" height="72" rx="8" />
          <text x="88" y="135" className="label">SENSOR</text>
          <rect x="448" y="90" width="120" height="72" rx="8" />
          <text x="466" y="135" className="label">DISPLAY</text>
          <rect x="72" y="280" width="120" height="64" rx="8" />
          <text x="98" y="321" className="label">KILL</text>
          <rect x="448" y="280" width="120" height="64" rx="8" />
          <text x="468" y="321" className="label">LIGHTS</text>
          <path d="M192 126h52M396 126h52M192 312h24l28-58M396 254l28 58h24" />
          <circle cx="218" cy="126" r="7" className="accent-fill" />
          <circle cx="422" cy="126" r="7" className="accent-fill" />
          <circle cx="226" cy="286" r="7" className="accent-fill" />
          <circle cx="414" cy="286" r="7" className="accent-fill" />
        </>
      )
    case "software":
      return (
        <>
          <rect x="82" y="90" width="390" height="224" rx="10" />
          <text x="112" y="132" className="label">LIVE TELEMETRY</text>
          <path d="M112 226h46l28-60 42 106 42-82 38 36h130" className="accent" />
          <path d="M112 282h326M112 158h326" className="detail" />
          <path d="M224 314v32M158 346h198" />
          <rect x="504" y="154" width="74" height="112" rx="8" />
          <text x="518" y="218" className="label">DATA</text>
          <path d="M472 210h32" className="accent" />
          <path d="M526 154v-30M556 154v-30" className="detail" />
        </>
      )
    case "public-relations":
      return (
        <>
          <path d="M72 170h248v146H72z" />
          <path d="m126 170 28-46h86l28 46" />
          <circle cx="196" cy="242" r="48" className="accent" />
          <circle cx="196" cy="242" r="17" />
          <rect x="380" y="82" width="142" height="244" rx="18" />
          <circle cx="451" cy="126" r="8" className="accent-fill" />
          <rect x="408" y="158" width="86" height="66" rx="5" className="detail" />
          <path d="M408 250h86M408 278h58" className="detail" />
          <path d="M540 150c28 22 28 58 0 80M568 122c50 42 50 94 0 136" className="accent" />
        </>
      )
    case "business":
      return (
        <>
          <path d="M82 104h286v232H82z" />
          <path d="M176 104V78h98v26" className="accent" />
          <path d="m120 160 14 14 28-32M120 222l14 14 28-32M120 284l14 14 28-32" className="accent" />
          <path d="M188 160h132M188 222h104M188 284h82" />
          <rect x="420" y="120" width="136" height="184" rx="8" />
          <rect x="448" y="150" width="80" height="42" rx="4" className="detail" />
          <text x="464" y="182" className="label label-large">$</text>
          <path d="M448 226h18M486 226h18M524 226h4M448 260h18M486 260h18M524 260h4" className="detail" />
        </>
      )
    case "corporate-relations":
      return (
        <>
          <rect x="72" y="128" width="180" height="156" rx="10" />
          <rect x="388" y="128" width="180" height="156" rx="10" />
          <text x="122" y="214" className="label label-large">TEAM</text>
          <text x="410" y="214" className="label">SPONSOR</text>
          <path d="M252 206h72M316 184l22 22-22 22" className="accent" />
          <path d="M388 246h-72M324 224l-22 22 22 22" className="accent" />
          <path d="M124 128V98h76v30M440 128V98h76v30" className="detail" />
          <circle cx="320" cy="206" r="58" className="detail" />
          <path d="M298 206h44" />
        </>
      )
    case "logistics":
      return (
        <>
          <path d="M72 176h308v126H72z" />
          <path d="M380 218h92l58 54v30H380z" />
          <path d="M472 218v54h58M90 156h74v78H90zM176 126h82v108h-82zM270 166h82v68h-82z" />
          <path d="M176 126v108M90 196h74M270 200h82" className="detail" />
          <circle cx="150" cy="316" r="28" />
          <circle cx="442" cy="316" r="28" />
          <path d="M72 344h480" className="detail" />
          <path d="M402 122h104M478 98l28 24-28 24" className="accent" />
          <text x="404" y="98" className="label">TO EVENT</text>
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
        className="[&_.accent-fill]:fill-primary [&_.accent-fill]:stroke-none [&_.accent]:stroke-primary [&_.detail]:stroke-white/35 [&_.label]:fill-white/60 [&_.label]:stroke-none [&_.label]:font-mono [&_.label]:text-[18px] [&_.label]:font-bold [&_.label-large]:text-[28px]"
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

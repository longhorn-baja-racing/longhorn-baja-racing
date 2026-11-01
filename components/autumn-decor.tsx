export default function AutumnDecor({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 240 140" fill="none" className={`pointer-events-none select-none ${className}`}>
      <g stroke="#cf8648" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M29 123c43-9 111-8 171 1" opacity=".3" />
        <path d="m82 64-2-18 10-5 3 23" fill="#8f754c" />
        <path d="M87 65C53 43 33 76 44 104c7 20 27 24 43 17 19 8 41 1 46-20 7-29-13-56-46-36Z" fill="#bf5700" fillOpacity=".18" />
        <ellipse cx="87" cy="91" rx="26" ry="32" />
        <ellipse cx="87" cy="91" rx="11" ry="32" />
        <path d="M91 52c13-17 28-9 19-1-6 5-12-2-6-6" />
        <g transform="translate(118 37) scale(.7)">
          <path d="m82 64-2-18 10-5 3 23" fill="#8f754c" />
          <path d="M87 65C53 43 33 76 44 104c7 20 27 24 43 17 19 8 41 1 46-20 7-29-13-56-46-36Z" fill="#d9ad72" fillOpacity=".12" />
          <ellipse cx="87" cy="91" rx="26" ry="32" />
          <ellipse cx="87" cy="91" rx="11" ry="32" />
        </g>
      </g>
      <g stroke="#d9ad72" strokeWidth="1.3" strokeLinejoin="round">
        <path d="m167 32 5-17 6 7 11-13 1 17 12-2-7 13 12 5-22 10-4 12-8-11-19-3 10-8-8-8Z" fill="#bf5700" fillOpacity=".22" />
        <path d="m181 64 3-30m-1 14-13-8m14 4 10-10" />
        <g transform="translate(-104 20) rotate(-25 180 40)">
          <path d="m167 32 5-17 6 7 11-13 1 17 12-2-7 13 12 5-22 10-4 12-8-11-19-3 10-8-8-8Z" fill="#d9ad72" fillOpacity=".12" />
          <path d="m181 64 3-30m-1 14-13-8m14 4 10-10" />
        </g>
      </g>
    </svg>
  )
}

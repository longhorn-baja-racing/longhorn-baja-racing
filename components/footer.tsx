import Image from "next/image"
import Link from "next/link"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""

const socialLinks = [
  { label: "GitHub", href: "https://github.com/longhorn-baja-racing" },
  { label: "Instagram", href: "https://www.instagram.com/longhornbajaracing/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/longhorn-baja-racing/" },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-primary/40 bg-[#080808]">
      <div className="absolute inset-y-0 left-0 w-2 bg-primary" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Image src={`${base}/lbr-logo.png`} alt="Longhorn Baja Racing" width={180} height={70} className="h-auto w-44" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">
            Student-built off-road engineering at The University of Texas at Austin.
          </p>
          <a href="mailto:longhornbaja@gmail.com" className="mt-5 inline-block text-sm font-bold text-primary transition hover:text-white">
            longhornbaja@gmail.com
          </a>
        </div>

        <div className="md:text-right">
          <div className="flex flex-wrap gap-5 md:justify-end">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black uppercase tracking-[0.18em] text-white/55 transition hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-7 text-xs uppercase tracking-[0.14em] text-white/30">
            &copy; {new Date().getFullYear()} Longhorn Baja Racing
          </p>
        </div>
      </div>
    </footer>
  )
}

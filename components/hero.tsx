import Image from "next/image"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default function Hero() {
  return (
    <section className="relative flex min-h-[620px] w-full items-end overflow-hidden bg-black md:min-h-[700px] lg:min-h-[min(780px,90svh)]">
      <div className="absolute inset-0">
        <picture>
        <source srcSet={`${base}/baja-team-photo-mobile.webp 960w, ${base}/baja-team-photo.webp 1920w`} sizes="100vw" type="image/webp" />
        <Image
          src={`${base}/baja-team-photo.webp`}
          alt="Longhorn Baja Racing team"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center lg:object-top"
        />
        </picture>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute inset-y-0 left-0 w-2 bg-primary" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12 pt-48 md:pb-16">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">UT Austin / Baja SAE</p>

          <h1 className="mb-5 text-7xl uppercase text-foreground sm:text-8xl md:text-9xl">
            Design. Build. <span className="text-primary">Race.</span>
          </h1>

          <p className="mb-6 max-w-xl border-l border-white/25 pl-5 text-base leading-relaxed text-white/75 md:text-lg">
            Hands-on engineering and off-road racing. Join a team building a single-seat vehicle to compete at Baja SAE.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button asChild className="h-12 rounded-none bg-primary px-8 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-primary/80">
            <a
              href={siteConfig.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
                Join the Team
            </a>
            </Button>

            <Button asChild className="h-12 rounded-none border border-white/40 bg-black/25 px-8 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:border-primary hover:bg-black/60">
            <a
              href={siteConfig.sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
                Become a Sponsor
            </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

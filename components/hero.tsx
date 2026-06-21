import Image from "next/image"
import { Button } from "@/components/ui/button"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default function Hero() {
  return (
    <section className="relative flex h-screen min-h-[700px] w-full items-end overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Image
          src={`${base}/baja-team-photo.jpg`}
          alt="Longhorn Baja Racing team"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center lg:object-top"
        />
      </div>

      <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-t from-black via-black/45 via-[35%] to-transparent to-[68%]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute inset-y-0 left-0 w-2 bg-primary" />

      <div className="relative z-10 w-full px-6 pb-12 lg:absolute lg:top-[max(7rem,calc(100vh-22rem))] lg:px-10 lg:pb-0 xl:px-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-primary">UT Austin / Baja SAE</p>

          <h1 className="mb-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground sm:text-6xl md:text-7xl">
            Design. Build. <span className="text-primary">Race.</span>
          </h1>

          <p className="mb-6 max-w-xl border-l border-white/25 pl-5 text-base leading-relaxed text-white/75 md:text-lg">
            Hands-on engineering and off-road racing. Join a team building a single-seat vehicle to compete at Baja SAE.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScnt7iGpsNXqgPrenaE_j7tIgZ8WXwcE2ux5DR1CmHHVevw3w/closedform"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="h-12 cursor-pointer rounded-none border border-primary bg-primary px-8 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/80">
                Join the Team
              </Button>
            </a>

            <a
              href="https://f8015311-d3fb-43ec-a118-e7f2cf0392b2.filesusr.com/ugd/6ade08_fae26c60d1c04d30b24660b24acb9c35.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="h-12 cursor-pointer rounded-none border border-white/30 bg-black/25 px-8 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:border-primary hover:bg-primary/10">
                Become a Sponsor
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

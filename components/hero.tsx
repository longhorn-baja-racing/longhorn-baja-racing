import { Button } from "@/components/ui/button"

const base = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default function Hero() {
  return (
    <section
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-black bg-contain bg-center bg-no-repeat pt-20"
      style={{ backgroundImage: `url(${base}/baja-team-photo.jpg)` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/25" />
      <div className="absolute inset-y-0 left-0 w-2 bg-primary" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-primary">UT Austin / Baja SAE</p>

          <h1 className="mb-6 text-6xl font-black uppercase leading-[0.86] tracking-[-0.065em] text-foreground sm:text-7xl md:text-8xl">
            Design.<br />Build. <span className="text-primary">Race.</span>
          </h1>

          <p className="mb-9 max-w-xl border-l border-white/25 pl-5 text-lg leading-relaxed text-white/75">
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

      <div className="absolute bottom-8 right-6 hidden text-right md:block">
        <p className="text-6xl font-black uppercase tracking-[-0.08em] text-white/10">Baja SAE</p>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">Built in Austin, Texas</p>
      </div>
    </section>
  )
}

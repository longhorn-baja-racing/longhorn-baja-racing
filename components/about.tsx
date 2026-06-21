import Section from "./section"

const stats = [
  { value: "01", label: "Vehicle" },
  { value: "100%", label: "Open Team" },
  { value: "Full", label: "Lifecycle" },
]

export default function About() {
  return (
    <Section title="About Us" label="WHO WE ARE" anchor="about">
      <div className="grid gap-10 lg:grid-cols-[1.45fr_0.55fr] lg:items-start">
        <p className="text-lg leading-relaxed text-white/75 md:text-xl">
          Longhorn Baja Racing at The University of Texas at Austin is a hands on, student led engineering team where members design, build, test, and race an off road vehicle for the SAE Baja competition series. Students gain real world experience by working through the full engineering lifecycle from concept development and CAD to fabrication, testing, and competition while learning directly from experienced teammates and mentors. The team thrives on iteration, problem solving, and getting dirty in the shop, constantly pushing to improve performance, reliability, and durability. By competing under real industry constraints like cost, safety regulations, and standardized rules, Longhorn Baja prepares students with practical skills, technical confidence, and teamwork experience that translate directly to careers in automotive and mechanical engineering.
        </p>

        <div className="grid grid-cols-3 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-1">
          {stats.map((stat) => (
            <div key={stat.label} className="industrial-card px-4 py-6 text-center lg:text-left">
              <p className="text-2xl font-black uppercase text-primary md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 pt-12 md:grid-cols-2">
        <div className="industrial-card relative overflow-hidden border border-white/10 p-8 transition duration-300 hover:-translate-y-1 hover:border-primary/70">
          <span className="absolute right-5 top-3 text-6xl font-black text-white/[0.035]">01</span>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-primary">Our Mission</p>
          <p className="leading-relaxed text-white/75">
            We aim to give hands-on engineering experience, and foster a community of passionate students dedicated to innovation, teamwork, and excellence in off-road vehicle design and competition.
          </p>
        </div>

        <div className="industrial-card relative overflow-hidden border border-white/10 p-8 transition duration-300 hover:-translate-y-1 hover:border-primary/70">
          <span className="absolute right-5 top-3 text-6xl font-black text-white/[0.035]">02</span>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-primary">Core Belief</p>
          <p className="leading-relaxed text-white/75">
            We believe that all interested students should have the opportunity to get involved in motorsports. That&#39;s why we have a 100 percent admission rate, ensuring that all members are able to learn and contribute to motorsports.
          </p>
        </div>
      </div>
    </Section>
  )
}

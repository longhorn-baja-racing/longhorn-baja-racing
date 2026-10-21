import Link from "next/link"
import Hero from "@/components/hero"

const destinations = [
  { number: "01", title: "The engineering", text: "Ten disciplines working together to take one vehicle from concept to competition.", href: "/subteams/", link: "Explore our subteams" },
  { number: "02", title: "The people", text: "Meet the students behind the design, fabrication, testing, and race-day decisions.", href: "/members/", link: "Meet the team" },
  { number: "03", title: "What’s next", text: "Follow the team calendar for upcoming meetings, events, and time in the shop.", href: "/calendar/", link: "View the calendar" },
]

export default function Home() {
  return (
    <>
      <Hero />
      <section className="site-section px-6 py-16 md:py-20" aria-labelledby="home-intro">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-4">Student built. Texas driven.</p>
              <h2 id="home-intro" className="text-5xl md:text-6xl">One team. Every terrain.</h2>
            </div>
            <Link href="/about/" className="text-sm text-white/75 underline decoration-primary underline-offset-8 hover:text-white">Get to know Longhorn Baja ↗</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {destinations.map((item) => (
              <Link key={item.href} href={item.href} prefetch={false} className="home-card group">
                <span className="font-mono text-xs text-primary-text">{item.number}</span>
                <h3 className="mt-7 text-3xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.text}</p>
                <span className="mt-7 block text-xs font-semibold text-white/85 group-hover:text-primary-text">{item.link} <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

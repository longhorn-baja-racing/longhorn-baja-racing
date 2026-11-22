import About from "@/components/home/about"
import Calendar from "@/components/home/calendar"
import Contact from "@/components/home/contact"
import Hero from "@/components/home/hero"
import Machine from "@/components/home/machine"
import Members from "@/components/home/members"
import Merch from "@/components/home/merch"
import Sponsors from "@/components/home/sponsors"
import Stage from "@/components/scene/stage"

export default function Home() {
  return (
    <>
      {/* The 3D stage stays pinned behind the hero, about, and subteam sections. */}
      <div className="scene-track" data-scene-track>
        <Stage />
        <Hero />
        <About />
        <Machine />
      </div>
      <Members />
      <Sponsors />
      <Merch />
      <Calendar />
      <Contact />
    </>
  )
}

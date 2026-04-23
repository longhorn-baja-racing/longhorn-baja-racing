import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Subteams from "@/components/subteams"
import Members from "@/components/members"
import Footer from "@/components/footer"
import Sponsors from "@/components/sponsors"

export default function Home() {
  return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <About />
        <Subteams />
        <Members />
        <Sponsors />
        <Footer />
      </main>
  )
}

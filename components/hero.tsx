"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function Hero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
      <section
          className="relative w-full h-screen bg-cover bg-center bg-no-repeat flex items-center pt-20 overflow-hidden"
          style={{
            backgroundImage: "url(/baja-team-photo.jpg)",
            backgroundPosition: `center ${scrollY * 0.5}px`,
          }}
      >
        <div className="absolute inset-0 bg-background/50"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <p className="text-primary text-sm font-black tracking-widest mb-4">UT AUSTIN • BAJA SAE</p>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">Design. Build. Race.</h1>

            <p className="text-lg text-foreground mb-8 max-w-xl leading-relaxed">
              Hands-on engineering and off-road racing. Join a team building a single-seat vehicle to compete at Baja SAE.
            </p>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button className="border-2 border-primary bg-transparent text-white hover:bg-primary hover:text-primary-foreground rounded-lg px-8 py-3 font-bold transition-colors cursor-pointer">
                Apply
              </Button>
              <Button className="border-2 border-primary bg-transparent text-white hover:bg-primary hover:text-primary-foreground rounded-lg px-8 py-3 font-bold transition-colors cursor-pointer">
                Sponsor
              </Button>
            </div>
          </div>
        </div>
      </section>
  )
}

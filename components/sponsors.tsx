"use client"

import Section from "@/components/section"
import Image from "next/image"

const sponsorList = [
  {
    name: "UT Austin",
    logo: "https://static.wixstatic.com/media/6ade08_c58983610983479099208ae2de779174~mv2.png/v1/fill/w_242,h_242,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/University_of_Texas_at_Austin_seal_svg.png",
  },
  {
    name: "some other sponsor",
    logo: "/generic-sponsor-logo-2.png",
  },
  {
    name: "idk",
    logo: "/generic-sponsor-logo-3.png",
  },
  {
    name: "more stuff",
    logo: "/sponsor-logo-4.jpg",
  },
  {
    name: "another",
    logo: "/sponsor-logo-5.png",
  },
  {
    name: "another sponsor ig",
    logo: "/sponsor-logo-6.jpg",
  },
]

export default function Sponsors() {
  return (
      <Section label="OUR PARTNERS" title="Sponsors" anchor="sponsors">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sponsorList.map((sponsor) => (
              <div
                  key={sponsor.name}
                  className="flex items-center justify-center p-8 bg-card border border-border rounded-lg hover:border-primary transition-colors"
              >
                <Image
                    src={sponsor.logo || "/placeholder.svg"}
                    alt={sponsor.name}
                    width={200}
                    height={120}
                    className="w-full h-auto max-h-24 object-contain"
                />
              </div>
          ))}
        </div>
      </Section>
  )
}

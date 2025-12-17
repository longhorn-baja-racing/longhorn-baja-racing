"use client"

import Section from "./section"

export default function About() {
  return (
      <Section title="About Us" label="WHO WE ARE" anchor="about">
        {/* Top Paragraph */}
        <div className="flex flex-col gap-8 justify-center">
          <p className="text-foreground text-lg leading-relaxed">
            Longhorn Baja Racing at The University of Texas at Austin is a hands on, student led engineering team where members design, build, test, and race an off road vehicle for the SAE Baja competition series.
            Students gain real world experience by working through the full engineering lifecycle from concept development and CAD to fabrication, testing, and competition while learning directly from experienced teammates and mentors.
            The team thrives on iteration, problem solving, and getting dirty in the shop, constantly pushing to improve performance, reliability, and durability.
            By competing under real industry constraints like cost, safety regulations, and standardized rules, Longhorn Baja prepares students with practical skills, technical confidence, and teamwork experience that translate directly to careers in automotive and mechanical engineering.
          </p>
        </div>

        {/* Two cards below */}
        <div className="grid md:grid-cols-1 gap-12 pt-10">
          <div className="flex flex-row gap-6">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-primary font-semibold mb-4">Our Mission</h3>
              <p className="text-card-foreground leading-relaxed mb-6">
                We aim to give hands-on engineering experience, and foster a community of passionate students dedicated to
                innovation, teamwork, and excellence in off-road vehicle design and competition.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-primary font-semibold mb-4">Core Belief</h3>
              <p className="text-card-foreground leading-relaxed mb-6">
                We believe that all interested students should have the opportunity to get involved in motorsports.
                That&#39;s why we have a 100 percent admission rate, ensuring that all members are able to learn and contribute to motorsports.
              </p>
            </div>
          </div>
        </div>
      </Section>
  )
}

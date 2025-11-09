"use client"

import Section from "./section"

export default function About() {
  return (
      <Section title="About Us" label="WHO WE ARE" anchor="about">
        {/* Top Paragraph */}
        <div className="flex flex-col gap-8 justify-center">
          <p className="text-foreground text-lg leading-relaxed">
            idk some stuff about us here
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
              <p className="text-muted-foreground text-sm">
                • we can put bullet points here
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-primary font-semibold mb-4">Core Belief</h3>
              <p className="text-card-foreground leading-relaxed mb-6">
                We believe that all interested students should have the opportunity to get involved in motorsports.
                That&#39;s why we have a 100% admission rate, ensuring that all members are able to learn and contribute.
              </p>
              <p className="text-muted-foreground text-sm">
                • more bullet points here
              </p>
            </div>
          </div>
        </div>
      </Section>
  )
}

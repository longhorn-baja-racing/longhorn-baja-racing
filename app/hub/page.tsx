import type { Metadata } from "next"
import Section from "@/components/section"
import Hub from "@/components/hub/hub"

export const metadata: Metadata = {
  title: "Team Hub",
  description: "Members-only links to Longhorn Baja Racing team resources.",
  alternates: { canonical: "/hub/" },
  openGraph: { url: "/hub/" },
  robots: { index: false, follow: false },
}

export default function HubPage() {
  return (
    <Section title="Team hub" label="MEMBERS ONLY">
      <Hub />
    </Section>
  )
}

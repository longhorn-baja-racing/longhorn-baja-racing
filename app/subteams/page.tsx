import type { Metadata } from "next"
import Subteams from "@/components/subteams"

export const metadata: Metadata = {
  title: "Subteams",
  description: "Explore the ten Longhorn Baja Racing engineering and operations subteams.",
  alternates: { canonical: "/subteams/" },
  openGraph: { url: "/subteams/" },
}

export default function Page() {
  return <Subteams />
}

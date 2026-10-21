import type { Metadata } from "next"
import Merch from "@/components/merch"

export const metadata: Metadata = {
  title: "Merch",
  description: "Preview upcoming Longhorn Baja Racing team gear.",
  alternates: { canonical: "/merch/" },
  openGraph: { url: "/merch/" },
}

export default function Page() {
  return <Merch />
}

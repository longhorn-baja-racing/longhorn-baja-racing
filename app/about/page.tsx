import type { Metadata } from "next"
import About from "@/components/about"

export const metadata: Metadata = {
  title: "About Us",
  description: "Longhorn Baja Racing’s mission and hands-on engineering at UT Austin.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
}

export default function Page() {
  return <About />
}

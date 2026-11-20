import type { Metadata } from "next"
import { pageMetadata, shareImages } from "@/lib/metadata"
import About from "@/components/about"

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "Longhorn Baja Racing’s mission and hands-on engineering at UT Austin.",
  path: "/about/",
  image: shareImages.team,
})

export default function Page() {
  return <About />
}

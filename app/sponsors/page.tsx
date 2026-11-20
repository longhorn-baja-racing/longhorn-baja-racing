import type { Metadata } from "next"
import { pageMetadata, shareImages } from "@/lib/metadata"
import Sponsors from "@/components/sponsors"

export const metadata: Metadata = pageMetadata({
  title: "Sponsors",
  description: "Meet the partners supporting Longhorn Baja Racing.",
  path: "/sponsors/",
  image: shareImages.sponsors,
})

export default function Page() {
  return <Sponsors />
}

import type { Metadata } from "next"
import { pageMetadata, shareImages } from "@/lib/metadata"
import Merch from "@/components/merch"

export const metadata: Metadata = pageMetadata({
  title: "Merch",
  description: "Preview upcoming Longhorn Baja Racing team gear.",
  path: "/merch/",
  image: shareImages.merch,
})

export default function Page() {
  return <Merch />
}

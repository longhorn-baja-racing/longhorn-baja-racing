import type { Metadata } from "next"
import { pageMetadata, shareImages } from "@/lib/metadata"
import Subteams from "@/components/subteams"

export const metadata: Metadata = pageMetadata({
  title: "Subteams",
  description: "Explore the ten Longhorn Baja Racing engineering and operations subteams.",
  path: "/subteams/",
  image: shareImages.subteams,
})

export default function Page() {
  return <Subteams />
}

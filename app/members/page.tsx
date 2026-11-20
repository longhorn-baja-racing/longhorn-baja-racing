import type { Metadata } from "next"
import { pageMetadata, shareImages } from "@/lib/metadata"
import Members from "@/components/members"

export const metadata: Metadata = pageMetadata({
  title: "Members",
  description: "Meet the students and team leads behind Longhorn Baja Racing.",
  path: "/members/",
  image: shareImages.members,
})

export default function Page() {
  return <Members />
}

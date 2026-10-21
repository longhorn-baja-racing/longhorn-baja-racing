import type { Metadata } from "next"
import Members from "@/components/members"

export const metadata: Metadata = {
  title: "Members",
  description: "Meet the students and team leads behind Longhorn Baja Racing.",
  alternates: { canonical: "/members/" },
  openGraph: { url: "/members/" },
}

export default function Page() {
  return <Members />
}

import type { Metadata } from "next"
import Sponsors from "@/components/sponsors"

export const metadata: Metadata = {
  title: "Sponsors",
  description: "Meet the partners supporting Longhorn Baja Racing.",
  alternates: { canonical: "/sponsors/" },
  openGraph: { url: "/sponsors/" },
}

export default function Page() {
  return <Sponsors />
}

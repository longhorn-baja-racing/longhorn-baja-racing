import Moved, { movedMetadata } from "@/components/site/moved"

export const metadata = movedMetadata("Subteams")

export default function Page() {
  return <Moved section="subteams" label="Subteams" />
}

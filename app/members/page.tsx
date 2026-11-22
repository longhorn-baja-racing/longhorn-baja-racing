import Moved, { movedMetadata } from "@/components/site/moved"

export const metadata = movedMetadata("Members")

export default function Page() {
  return <Moved section="members" label="Members" />
}

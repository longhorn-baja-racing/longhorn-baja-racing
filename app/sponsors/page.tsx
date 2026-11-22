import Moved, { movedMetadata } from "@/components/site/moved"

export const metadata = movedMetadata("Sponsors")

export default function Page() {
  return <Moved section="sponsors" label="Sponsors" />
}

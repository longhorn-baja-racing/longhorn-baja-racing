import Moved, { movedMetadata } from "@/components/site/moved"

export const metadata = movedMetadata("About")

export default function Page() {
  return <Moved section="about" label="About" />
}

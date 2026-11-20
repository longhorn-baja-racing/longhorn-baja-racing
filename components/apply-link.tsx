import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site"

// Applications are open when siteConfig.applications.open is true. Building
// with NEXT_PUBLIC_APPLICATIONS_OPEN=false forces the closed state, so it can
// be previewed and tested without editing lib/site.ts. The site is a static
// export, so either way the state is fixed at build time.
export function applicationsOpen(): boolean {
  if (process.env.NEXT_PUBLIC_APPLICATIONS_OPEN === "false") return false
  return siteConfig.applications.open
}

interface ApplyLinkProps {
  // Link text while applications are open.
  children: ReactNode
  // Classes for the open link (or for the Button when `button` is set).
  className?: string
  // Classes for the closed-state message.
  closedClassName?: string
  // Render the open link through the shared Button styles.
  button?: boolean
}

// Every public entry point to the application form uses this component, so
// opening or closing applications in lib/site.ts updates the whole site.
export default function ApplyLink({ children, className, closedClassName, button = false }: ApplyLinkProps) {
  if (!applicationsOpen()) {
    return <p className={closedClassName} data-applications="closed">{siteConfig.applications.closedMessage}</p>
  }

  if (button) {
    return (
      <Button asChild className={className}>
        <a href={siteConfig.applyUrl} target="_blank" rel="noopener noreferrer">{children}</a>
      </Button>
    )
  }
  return <a href={siteConfig.applyUrl} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
}

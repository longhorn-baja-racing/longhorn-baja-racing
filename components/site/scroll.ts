"use client"

/** Smoothly scrolls to a home-page section and keeps the URL hash in sync. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return false
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  history.replaceState(null, "", `#${id}`)
  // Move keyboard focus with the view so the next Tab starts in the section.
  const focusTarget = target.matches("section") ? target : target.closest("section") ?? target
  if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1")
  ;(focusTarget as HTMLElement).focus({ preventScroll: true })
  return true
}

/** True when the link's path points at the home page this document is showing. */
export function isHomePath(pathname: string) {
  return pathname === "/" || pathname === ""
}

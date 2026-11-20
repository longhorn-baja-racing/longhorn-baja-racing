import { test, expect } from "@playwright/test"
import { createElement, type ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import Hero from "@/components/hero"
import ContactPage from "@/app/contact/page"
import { siteConfig } from "@/lib/site"

// The production export is built with applications open, so the closed state
// cannot be reached through the served site. Instead, render the real public
// entry points with the same build-time switch the site reads
// (NEXT_PUBLIC_APPLICATIONS_OPEN=false) and check the result in each browser.
// Closing applications in lib/site.ts takes the same code path.
function renderClosed(component: ComponentType) {
  const previous = process.env.NEXT_PUBLIC_APPLICATIONS_OPEN
  process.env.NEXT_PUBLIC_APPLICATIONS_OPEN = "false"
  try {
    return renderToStaticMarkup(createElement(component))
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_APPLICATIONS_OPEN
    else process.env.NEXT_PUBLIC_APPLICATIONS_OPEN = previous
  }
}

const entryPoints: [string, ComponentType, string][] = [
  ["home page hero", Hero, "Join the Team"],
  ["Join / Contact page", ContactPage, "Apply to Longhorn Baja \u2197"],
]

for (const [name, component, linkText] of entryPoints) {
  test("closed applications replace the " + name + " apply link with a message", async ({ page }) => {
    await page.setContent("<!doctype html><html lang='en'><body><main>" + renderClosed(component) + "</main></body></html>")
    const message = page.getByText(siteConfig.applications.closedMessage, { exact: true })
    await expect(message).toBeVisible()
    await expect(message).toHaveAttribute("data-applications", "closed")
    expect(await message.evaluate(element => element.tagName)).toBe("P")
    await expect(message.locator("a, button")).toHaveCount(0)
    await expect(page.getByRole("link", { name: linkText })).toHaveCount(0)
    await expect(page.locator('a[href="' + siteConfig.applyUrl + '"]')).toHaveCount(0)
  })
}

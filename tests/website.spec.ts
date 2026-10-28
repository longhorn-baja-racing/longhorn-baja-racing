import { test as base, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

// External services are outside this repo's control. Keep CI deterministic while
// checking the real embed URL and local UI, assets, and JavaScript below.
const test = base.extend({
  page: async ({ page }, runTest) => {
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()) })
    page.on("response", response => {
      if (response.url().startsWith("http://127.0.0.1:4173") && response.status() >= 400)
        errors.push(response.status() + " " + response.url())
    })
    await page.route("https://calendar.google.com/**", route => route.fulfill({ contentType: "text/html", body: "<html lang='en'><title>Calendar test fixture</title><body>Team calendar</body></html>" }))
    await page.route("https://www.longhornsimracing.org/**", route => route.fulfill({ contentType: "image/svg+xml", body: "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'><rect width='200' height='100' fill='black'/></svg>" }))
    await runTest(page)
    expect(errors, "No browser exceptions, console errors, or broken local requests").toEqual([])
  },
})

const pages = [
  ["/", "Design. Build. Race."],
  ["/about/", "About Us"],
  ["/subteams/", "Subteams"],
  ["/members/", "Members"],
  ["/calendar/", "Team calendar"],
  ["/merch/", "Merch"],
  ["/sponsors/", "Sponsors"],
  ["/contact/", "Build with us"],
]

for (const [path, heading] of pages) {
  test(path + " renders accessible content without broken assets", async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(heading)
    // Exercise lazy images throughout the page, not just above the fold.
    for (const image of await page.locator("img").all()) {
      await image.scrollIntoViewIfNeeded()
      await expect(image).toHaveJSProperty("complete", true)
      expect(await image.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
    expect(result.violations.filter(item => item.impact === "serious" || item.impact === "critical").map(item => ({ rule: item.id, nodes: item.nodes.map(node => ({ target: node.target, message: node.failureSummary })) }))).toEqual([])
  })
}

test("navigation works and marks the current page", async ({ page, isMobile }) => {
  await page.goto("/")
  if (isMobile) {
    await page.getByRole("button", { name: "Menu +" }).click()
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible()
    await page.getByRole("button", { name: "Close −" }).press("Escape")
    await expect(page.getByRole("button", { name: "Menu +" })).toBeFocused()
  }
  for (const [path] of pages.slice(1)) {
    if (isMobile) await page.getByRole("button", { name: "Menu +" }).click()
    const link = page.locator('nav a[href="' + path + '"]')
    await link.click()
    await expect(page).toHaveURL(new RegExp(path.replace(/\/$/, "") + "/?$"))
    await expect(link).toHaveAttribute("aria-current", "page")
    if (isMobile) await expect(page.getByRole("button", { name: "Menu +" })).toHaveAttribute("aria-expanded", "false")
  }
})

test("subteams expand and collapse by keyboard", async ({ page }) => {
  await page.goto("/subteams/")
  const card = page.getByRole("button", { name: /Subteam.*Powertrain/ })
  await card.focus()
  await card.press("Enter")
  await expect(card).toHaveAttribute("aria-expanded", "true")
  await expect(card).toContainText("transmit power from the engine to the wheels")
  await card.press("Space")
  await expect(card).toHaveAttribute("aria-expanded", "false")
})

test("merch selection announces availability", async ({ page }) => {
  await page.goto("/merch/")
  await page.getByRole("button", { name: "Evergreen Hoodie, coming soon", exact: true }).click()
  await expect(page.locator('[aria-live="polite"]')).toContainText("Evergreen Hoodie is coming soon")
})

test("calendar uses the correct account and Austin time", async ({ page }) => {
  await page.goto("/calendar/")
  const frame = page.locator('iframe[title="Longhorn Baja Racing team events"]')
  const url = new URL((await frame.getAttribute("src"))!)
  expect(url.origin).toBe("https://calendar.google.com")
  expect(url.searchParams.get("src")).toBe("longhornbaja@gmail.com")
  expect(url.searchParams.get("ctz")).toBe("America/Chicago")
  expect(url.searchParams.get("mode")).toBe("AGENDA")
  await expect(page.getByRole("link", { name: "Open / add in Google Calendar ↗" })).toHaveAttribute("href", /cid=bG9uZ2hvcm5iYWphQGdtYWlsLmNvbQ/)
})

for (const [hash, path] of Object.entries({ about: "about", team: "subteams", members: "members", merch: "merch", sponsors: "sponsors" })) {
  test("old #" + hash + " links redirect", async ({ page }) => {
    await page.goto("/#" + hash)
    await expect(page).toHaveURL(new RegExp("/" + path + "/?$"))
  })
}

test("application and sponsorship links stay usable", async ({ page }) => {
  await page.goto("/contact/")
  await expect(page.getByRole("link", { name: "Apply to Longhorn Baja ↗" })).toHaveAttribute("href", /^https:\/\/docs.google.com\/forms\//)
  await expect(page.getByRole("main").getByRole("link", { name: "longhornbaja@gmail.com", exact: true })).toHaveAttribute("href", "mailto:longhornbaja@gmail.com")
  await expect(page.getByRole("link", { name: "View sponsorship information ↗" })).toHaveAttribute("href", "https://drive.google.com/file/d/1RUknYrIfWhk4B-6uqn1mqxKWQ1dn5JYZ/view?usp=sharing")
})

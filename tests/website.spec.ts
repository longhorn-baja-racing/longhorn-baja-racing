import { test as base, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

// External services are outside this repo's control. Keep CI deterministic while
// checking local UI, assets, and JavaScript below.

// Calendar data is generated at build time from Google; tests use fixed far-future events.
const calendarFixture = {
  status: "ok",
  generatedAt: "2099-01-01T00:00:00.000Z",
  timeZone: "America/Chicago",
  events: [
    { id: "past@2000", title: "Old meeting", allDay: false, start: "2000-01-01T18:00:00.000Z", end: "2000-01-01T19:00:00.000Z" },
    { id: "meeting@2099", title: "General meeting", allDay: false, start: "2099-01-15T00:00:00.000Z", end: "2099-01-15T01:30:00.000Z", location: "ETC 2.136", description: "Bring a laptop." },
    { id: "broken", title: "Broken event", allDay: false, start: "not a date", end: "also not a date" },
    { id: "comp@2099", title: "Spring competition", allDay: true, start: "2099-02-01", end: "2099-02-04" },
    { id: "workday@2099", title: "Shop workday", allDay: false, start: "2099-02-08T16:00:00.000Z", end: "2099-02-09T00:00:00.000Z", location: "ETC Fishbowl" },
    { id: "social@2099", title: "Team social", allDay: false, start: "2099-03-01T00:00:00.000Z", end: "2099-03-01T02:00:00.000Z" },
  ],
}

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
    await page.route("**/data/calendar.json", route => route.fulfill({ json: calendarFixture }))
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

test("merch cards show the catalog and link to individual Printful products", async ({ page }) => {
  await page.goto("/merch/")
  const cards = page.getByRole("article")
  await expect(cards).toHaveCount(17)
  const urls = new Set<string>()
  for (const card of await cards.all()) {
    await expect(card.getByRole("img")).toHaveAttribute("src", /\/merch\/\d+(?:-back)?\.webp$/)
    const link = card.getByRole("link", { name: /^Shop / })
    const href = (await link.getAttribute("href"))!
    expect(href).toMatch(/^https:\/\/longhornbajaracing\.printful\.me\/product\/[a-z0-9-]+$/)
    urls.add(href)
    await expect(link).toHaveAttribute("rel", "noopener noreferrer")
    await link.focus()
    await expect(link).toBeFocused()
  }
  expect(urls.size).toBe(17)
  const priceLabels = await cards.getByText(/^From \$/).allTextContents()
  const prices = priceLabels.map(label => Number(label.replace("From $", "")))
  expect(prices).toHaveLength(17)
  expect(prices).toEqual([...prices].sort((a, b) => b - a))
  await expect(cards.first()).toContainText("Unisex X-Ray Hoodie")
  await expect(cards.last()).toContainText("That Didn't Happen In CAD Sticker")
  await expect(page.getByRole("img", { name: /Maanas.*printed back view/ })).toBeAttached()
  await expect(page.getByRole("link", { name: /Shop That Didn't Happen In CAD Shirt/ })).toHaveAttribute("href", "https://longhornbajaracing.printful.me/product/peter-meerkat-shirt-copy")
  await expect(page.getByRole("link", { name: "Visit the full store ↗" })).toHaveAttribute("href", "https://longhornbajaracing.printful.me/")
  await expect(page.getByRole("main")).not.toContainText("coming soon")
})

test("calendar lists upcoming events in Austin time without an iframe", async ({ page }) => {
  await page.goto("/calendar/")
  await expect(page.locator("iframe")).toHaveCount(0)
  const main = page.getByRole("main")
  await expect(main.getByRole("heading", { level: 2, name: "January 2099" })).toBeVisible()
  await expect(main.getByRole("heading", { level: 2, name: "February 2099" })).toBeVisible()

  const meeting = main.getByRole("listitem").filter({ hasText: "General meeting" })
  await expect(meeting).toContainText("Wednesday, January 14")
  await expect(meeting).toContainText(/6:00\sPM - 7:30\sPM CST/)
  await expect(meeting).toContainText("ETC 2.136")
  await expect(meeting).toContainText("Bring a laptop.")

  const competition = main.getByRole("listitem").filter({ hasText: "Spring competition" })
  await expect(competition).toContainText("Feb 1 - Feb 3")
  await expect(competition).toContainText("All day")

  await expect(main.getByRole("listitem").filter({ hasText: "Shop workday" })).toContainText(/10:00\sAM - 6:00\sPM CST/)
  await expect(main).not.toContainText("Old meeting")
  await expect(main).not.toContainText("Broken event")

  const add = meeting.getByRole("link", { name: /Add General meeting .* to Google Calendar/ })
  const url = new URL((await add.getAttribute("href"))!)
  expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render")
  expect(url.searchParams.get("action")).toBe("TEMPLATE")
  expect(url.searchParams.get("text")).toBe("General meeting")
  expect(url.searchParams.get("dates")).toBe("20990115T000000Z/20990115T013000Z")
  expect(url.searchParams.get("ctz")).toBe("America/Chicago")
  await expect(competition.getByRole("link", { name: /Add Spring competition/ })).toHaveAttribute("href", /dates=20990201%2F20990204/)

  await expect(page.getByRole("link", { name: "Open / add in Google Calendar \u2197" })).toHaveAttribute("href", /cid=bG9uZ2hvcm5iYWphQGdtYWlsLmNvbQ/)
})

test("homepage previews the next three events", async ({ page }) => {
  await page.goto("/")
  const events = page.getByRole("region", { name: "Upcoming events" })
  await expect(events.getByRole("listitem")).toHaveCount(3)
  await expect(events.getByRole("listitem").first()).toContainText("General meeting")
  await events.getByRole("link", { name: "View full calendar" }).click()
  await expect(page).toHaveURL(/\/calendar\/$/)
})

const calendarStates: [string, (route: import("@playwright/test").Route) => Promise<void>, RegExp][] = [
  ["no upcoming events", route => route.fulfill({ json: { ...calendarFixture, events: [calendarFixture.events[0]] } }), /No upcoming events are scheduled/],
  ["feed unavailable at build time", route => route.fulfill({ json: { ...calendarFixture, status: "unavailable", events: [] } }), /could not be loaded/],
  ["malformed calendar data", route => route.fulfill({ contentType: "application/json", body: "{ not json" }), /could not be loaded/],
]
for (const [name, handler, message] of calendarStates) {
  test("calendar handles " + name, async ({ page }) => {
    await page.route("**/data/calendar.json", handler)
    await page.goto("/calendar/")
    const status = page.getByRole("main").getByRole("status")
    await expect(status).toContainText(message)
    await expect(status.getByRole("link", { name: "open the team calendar in Google Calendar" })).toHaveAttribute("href", /cid=/)
  })
}

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


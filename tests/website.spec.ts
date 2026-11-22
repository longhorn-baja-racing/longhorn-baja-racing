import { type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "./fixtures"

// Seasonal decorations depend on the date; these tests turn them off and
// seasonal.spec.ts covers each one explicitly.
const off = "?season=off"

const pages = [
  ["/", "Design. Build. Race."],
  ["/merch/", "Merch"],
  ["/calendar/", "Team calendar"],
]

async function scrollTo(page: Page, selector: string) {
  await page.evaluate(sel => { document.documentElement.style.scrollBehavior = "auto"; document.querySelector(sel)!.scrollIntoView() }, selector)
}

for (const [path, heading] of pages) {
  test(path + " renders accessible content without broken assets", async ({ page }) => {
    const response = await page.goto(path + off)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(heading)
    // Exercise lazy images throughout the page, not just above the fold.
    const checked = new Set<string>()
    for (const image of await page.locator("main img").all()) {
      const src = await image.getAttribute("src")
      if (src && checked.has(src)) continue
      if (src) checked.add(src)
      await image.scrollIntoViewIfNeeded()
      await expect(image).toHaveJSProperty("complete", true)
      expect(await image.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
    expect(result.violations.filter(item => item.impact === "serious" || item.impact === "critical").map(item => ({ rule: item.id, nodes: item.nodes.map(node => ({ target: node.target, message: node.failureSummary })) }))).toEqual([])
  })
}

test("home keeps every former page as a section", async ({ page }) => {
  await page.goto("/" + off)
  const main = page.getByRole("main")
  for (const name of ["Who we are", "Ten subteams. One machine.", "The people behind the machine.", "Built with our partners.", "Rep the team.", "What's next.", "Build with us."]) {
    await expect(main.getByRole("heading", { level: 2, name })).toBeAttached()
  }
  await expect(main).toContainText("hands-on, student-led engineering team")
  await expect(main).toContainText("We aim to give hands-on engineering experience")
  await expect(main).toContainText("meaningful opportunities to get involved in motorsports")
  await expect(page.locator(".lead")).toHaveCount(17)
  await expect(page.locator(".lead-name").first()).toHaveText("Yash Tate")
  await expect(page.locator("#sponsors").getByRole("img")).toHaveCount(14)
  await expect(page.getByRole("link", { name: /Walker Department of Mechanical Engineering/ })).toHaveAttribute("href", "https://www.me.utexas.edu")
})

test("navigation scrolls to sections and marks the current one", async ({ page, isMobile }) => {
  await page.goto("/" + off)
  const toggle = page.getByRole("button", { name: "Menu" })
  if (isMobile) {
    await toggle.click()
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
  }
  for (const [label, id] of [["Team", "members"], ["Sponsors", "sponsors"], ["About", "about"], ["Join", "contact"]]) {
    if (isMobile) await toggle.click()
    const link = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: new RegExp(label + "$") })
    await link.click()
    await expect(page).toHaveURL(new RegExp("#" + id + "$"))
    await expect.poll(() => page.evaluate(id => Math.abs(document.getElementById(id)!.getBoundingClientRect().top), id), { timeout: 8000 }).toBeLessThan(4)
    // The mobile menu closes after a jump, so check the link by its address.
    await expect(page.locator('#site-navigation a[href="/#' + id + '"]')).toHaveAttribute("aria-current", "true")
    if (isMobile) await expect(toggle).toHaveAttribute("aria-expanded", "false")
  }
})

test("links from other pages land on home sections", async ({ page, isMobile }) => {
  await page.goto("/merch/" + off)
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click()
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: /Subteams$/ }).click()
  await expect(page).toHaveURL(/\/#subteams$/)
  await expect(page.getByRole("heading", { name: "Ten subteams. One machine." })).toBeInViewport()
})

test("the hero scroll control presses down to the next section", async ({ page }) => {
  await page.goto("/" + off)
  await page.getByRole("link", { name: "Explore the team" }).click()
  await expect(page).toHaveURL(/#about$/)
  await expect(page.getByRole("heading", { name: "Who we are" })).toBeInViewport()
})

test("every subteam has its own step in the 3D walkthrough", async ({ page, isMobile }) => {
  await page.goto("/" + off)
  const steps = page.locator(".step")
  await expect(steps).toHaveCount(10)
  await expect(page.locator("#powertrain")).toContainText("transmit power from the engine to the wheels")
  await expect(page.locator("#logistics")).toContainText("transportation, storage, and event coordination")
  await expect(page.locator(".step-kind--eng")).toHaveCount(6)
  if (!isMobile) {
    const index = page.getByRole("navigation", { name: "Subteams" })
    await scrollTo(page, "#powertrain")
    await index.getByRole("link", { name: /Chassis/ }).click()
    await expect(page).toHaveURL(/#chassis$/)
    await expect(index.getByRole("link", { name: /Chassis/ })).toHaveAttribute("aria-current", "step")
  }
})

test("the 3D stage loads lazily and never blocks the page", async ({ page, browserName }) => {
  test.slow()
  // CI browsers render WebGL in software, which the site normally skips; force it here.
  await page.goto("/" + off + "&3d=force")
  const stage = page.locator(".stage")
  await expect(stage).toHaveAttribute("aria-hidden", "true")
  // Headless browsers may or may not have WebGL; either way the page must settle.
  await expect(stage).toHaveAttribute("data-state", /ready|off/, { timeout: 15000 })
  if (browserName === "chromium" && (await stage.getAttribute("data-state")) === "ready") {
    await expect(stage.locator("canvas")).toHaveCount(1)
    await scrollTo(page, "#chassis")
    await expect(page.locator(".stage-callout-text")).toHaveText("Frame", { timeout: 8000 })
  }
  // Leaving the page disposes the renderer cleanly.
  await page.getByRole("link", { name: /See all 17 items/ }).click()
  await expect(page).toHaveURL(/\/merch\/$/)
  await expect(page.locator(".stage")).toHaveCount(0)
})

test("merch: full catalog page and home rail link to Printful products", async ({ page }) => {
  await page.goto("/merch/" + off)
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
  }
  expect(urls.size).toBe(17)
  const prices = (await page.locator(".product-price").allTextContents()).map(label => Number(label.replace("From $", "")))
  expect(prices).toHaveLength(17)
  expect(prices).toEqual([...prices].sort((a, b) => b - a))
  await expect(cards.first()).toContainText("Unisex X-Ray Hoodie")
  await expect(cards.last()).toContainText("That Didn't Happen In CAD Sticker")
  await expect(page.getByRole("img", { name: /Maanas.*printed back view/ })).toBeAttached()
  await expect(page.getByRole("link", { name: /Shop That Didn't Happen In CAD Shirt/ })).toHaveAttribute("href", "https://longhornbajaracing.printful.me/product/peter-meerkat-shirt-copy")
  await expect(page.getByRole("link", { name: "Visit the full store" })).toHaveAttribute("href", "https://longhornbajaracing.printful.me/")

  await page.goto("/" + off)
  const rail = page.getByRole("list", { name: "Featured merch" })
  await expect(rail.getByRole("listitem")).toHaveCount(10)
  await scrollTo(page, "#merch")
  const previous = page.getByRole("button", { name: "Previous items" })
  await expect(previous).toBeDisabled()
  await page.getByRole("button", { name: "Next items" }).click()
  await expect(previous).toBeEnabled()
})

test("calendar uses the correct account and Austin time", async ({ page }) => {
  await page.goto("/calendar/" + off)
  const frame = page.locator('iframe[title="Longhorn Baja Racing team events"]')
  const url = new URL((await frame.getAttribute("src"))!)
  expect(url.origin).toBe("https://calendar.google.com")
  expect(url.searchParams.get("src")).toBe("longhornbaja@gmail.com")
  expect(url.searchParams.get("ctz")).toBe("America/Chicago")
  expect(url.searchParams.get("mode")).toBe("AGENDA")
  await expect(page.getByRole("link", { name: "Open / add in Google Calendar" })).toHaveAttribute("href", /cid=bG9uZ2hvcm5iYWphQGdtYWlsLmNvbQ/)

  // On the home page the embed loads only when asked.
  await page.goto("/" + off)
  await expect(page.locator("iframe")).toHaveCount(0)
  await page.getByRole("button", { name: "Show the agenda here" }).click()
  await expect(page.locator('iframe[title="Longhorn Baja Racing team events"]')).toHaveAttribute("src", /mode=AGENDA/)
})

for (const route of ["about", "subteams", "members", "sponsors", "contact"]) {
  test("old /" + route + "/ page forwards to its home section", async ({ page }) => {
    await page.goto("/" + route + "/")
    await expect(page).toHaveURL(new RegExp("/#" + route + "$"))
    await expect(page.locator("#" + route)).toBeAttached()
  })
}

test("old #team links land on the subteams", async ({ page }) => {
  await page.goto("/" + off + "#team")
  await expect(page).toHaveURL(/#subteams$/)
})

test("application and sponsorship links stay usable", async ({ page }) => {
  await page.goto("/" + off)
  await expect(page.getByRole("link", { name: "Apply to Longhorn Baja" })).toHaveAttribute("href", /^https:\/\/docs.google.com\/forms\//)
  await expect(page.getByRole("main").getByRole("link", { name: "longhornbaja@gmail.com", exact: true })).toHaveAttribute("href", "mailto:longhornbaja@gmail.com")
  await expect(page.getByRole("link", { name: "View sponsorship information" })).toHaveAttribute("href", "https://drive.google.com/file/d/1RUknYrIfWhk4B-6uqn1mqxKWQ1dn5JYZ/view?usp=sharing")
  await expect(page.getByRole("link", { name: "Become a Sponsor" }).first()).toHaveAttribute("href", "https://drive.google.com/file/d/1RUknYrIfWhk4B-6uqn1mqxKWQ1dn5JYZ/view?usp=sharing")
})

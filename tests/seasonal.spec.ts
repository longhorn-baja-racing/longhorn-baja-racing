import { expect, test } from "./fixtures"

const strips = [
  ["autumn", "Shake the autumn vine to release leaves", "Fall leaves"],
  ["winter", "Jingle the lights to let it snow", "Winter lights"],
  ["bluebonnets", "Shake the bluebonnets loose", "Bluebonnet season"],
] as const

for (const [id, label, name] of strips) {
  test(id + " decoration hangs from the header and releases a burst", async ({ page }) => {
    await page.goto("/?season=" + id)
    const strip = page.getByRole("button", { name: label })
    const header = page.locator("header.site-header")
    await expect(strip).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute("data-season", id)
    await expect(page.locator("canvas.season-particles")).toHaveCount(1)
    await expect(page.locator("[data-season-note]")).toContainText(name)

    const before = (await strip.boundingBox())!
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 1600) })
    await expect.poll(async () => (await strip.boundingBox())!.y).toBeCloseTo(before.y, 0)
    expect(await header.evaluate(el => getComputedStyle(el).position)).toBe("fixed")

    await strip.click()
    await expect(strip).toHaveAttribute("data-bursts", "1")
    await strip.focus()
    await strip.press("Enter")
    await expect(strip).toHaveAttribute("data-bursts", "2")
  })
}

test("fireflies have no header strip but still glow", async ({ page }) => {
  await page.goto("/?season=fireflies")
  await expect(page.locator("html")).toHaveAttribute("data-season", "fireflies")
  await expect(page.locator(".season-strip")).toHaveCount(0)
  await expect(page.locator("canvas.season-particles")).toHaveCount(1)
  await expect(page.locator("[data-season-note]")).toContainText("Summer fireflies")
})

test("decorations switch on and off with the date", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 15, 12))
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Shake the autumn vine to release leaves" })).toBeVisible()
  await expect(page.locator("[data-season-note]")).toContainText("Fall leaves until November 30")

  await page.clock.setFixedTime(new Date(2027, 1, 15, 12))
  await page.goto("/")
  await expect(page.locator(".stage")).toBeAttached()
  await expect(page.locator(".season-strip")).toHaveCount(0)
  await expect(page.locator("canvas.season-particles")).toHaveCount(0)
  await expect(page.locator("[data-season-note]")).toHaveCount(0)

  await page.clock.setFixedTime(new Date(2026, 11, 28, 12))
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Jingle the lights to let it snow" })).toBeVisible()
  await expect(page.locator("[data-season-note]")).toContainText("Winter lights until January 6")
})

test("reduced motion keeps decorations still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?season=autumn")
  const strip = page.getByRole("button", { name: "Shake the autumn vine to release leaves" })
  await expect(strip.locator(".season-vine")).toHaveCSS("animation-name", "none")
  await strip.click()
  await expect(strip).toHaveAttribute("data-bursts", "0")
})

test("extension body attributes do not cause hydration warnings", async ({ page }) => {
  await page.route("http://127.0.0.1:4173/?season=autumn", async route => {
    const response = await route.fetch()
    const body = (await response.text()).replace(/<body([ >])/, '<body data-new-gr-c-s-check-loaded="14.1162.0" data-gr-ext-installed=""$1')
    await route.fulfill({ response, body })
  })
  await page.goto("/?season=autumn")
  await expect(page.locator("body")).toHaveAttribute("data-gr-ext-installed", "")
  const strip = page.getByRole("button", { name: "Shake the autumn vine to release leaves" })
  await strip.focus()
  await strip.press("Enter")
  await expect(strip).toHaveAttribute("data-bursts", "1")
})

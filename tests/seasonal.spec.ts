import { expect, test } from "./fixtures"

const strips = [
  ["autumn", "autumn", "Shake the autumn vine to release leaves", "Fall leaves"],
  ["winter", "winter", "Shake the snow loose", "December snow"],
  ["christmas", "christmas", "Jingle the lights to let it snow", "Merry Christmas"],
] as const

for (const [preview, id, label, name] of strips) {
  test(preview + " decoration hangs from the header and releases a burst", async ({ page }) => {
    await page.goto("/?season=" + preview)
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

test("Christmas week adds baubles and a hat; plain December does not", async ({ page }) => {
  await page.goto("/?season=christmas")
  await expect(page.locator(".season-bauble")).toHaveCount(4)
  await expect(page.locator(".season-hat")).toHaveCount(1)
  await page.goto("/?season=winter")
  await expect(page.locator(".season-drift")).toHaveCount(1)
  await expect(page.locator(".season-bauble, .season-hat, .season-bulb")).toHaveCount(0)
})

test("decorations switch on and off with the date", async ({ page }) => {
  const cases: [Date, string | null, string | null][] = [
    [new Date(2026, 9, 15, 12), "Shake the autumn vine to release leaves", "Fall leaves until October 31"],
    [new Date(2026, 10, 15, 12), null, null],
    [new Date(2026, 11, 5, 12), "Shake the snow loose", "December snow until December 31"],
    [new Date(2026, 11, 22, 12), "Jingle the lights to let it snow", "Merry Christmas"],
    [new Date(2027, 1, 15, 12), null, null],
  ]
  for (const [date, label, note] of cases) {
    await page.clock.setFixedTime(date)
    await page.goto("/")
    await expect(page.locator(".stage")).toBeAttached()
    if (label) await expect(page.getByRole("button", { name: label })).toBeVisible()
    else await expect(page.locator(".season-strip, canvas.season-particles")).toHaveCount(0)
    if (note) await expect(page.locator("[data-season-note]")).toHaveText(note)
    else await expect(page.locator("[data-season-note]")).toHaveCount(0)
  }
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

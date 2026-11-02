import { test, expect } from "@playwright/test"

test("header vine stays attached on scroll and releases temporary leaves", async ({ page }) => {
  await page.goto("/")
  const frame = page.locator("header .autumn-frame")
  await expect(frame.locator(".autumn-garland")).toHaveCount(1)
  const initial = (await frame.boundingBox())!
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 400) })
  await expect.poll(async () => (await frame.boundingBox())!.y).toBeCloseTo(initial.y, 0)

  const vine = page.getByRole("button", { name: "Shake the autumn vine to release leaves" })
  const bounds = (await vine.boundingBox())!
  await vine.click({ position: { x: bounds.width / 2, y: bounds.height - 6 } })
  await expect(page.locator(".autumn-burst-leaf")).toHaveCount(12)
  await vine.focus()
  await vine.press("Enter")
  await expect(page.locator(".autumn-burst-leaf")).toHaveCount(24)
  await expect(page.locator(".autumn-burst-leaf")).toHaveCount(0, { timeout: 8000 })

  await page.emulateMedia({ reducedMotion: "reduce" })
  await vine.press("Space")
  await expect(page.locator(".autumn-burst-leaf")).toHaveCount(0)
  await expect(frame.locator(".autumn-vine")).toHaveCSS("animation-name", "none")
})

test("extension body attributes do not cause hydration warnings", async ({ page }) => {
  const errors: string[] = []
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()) })
  page.on("pageerror", error => errors.push(error.message))
  await page.route("http://127.0.0.1:4173/", async route => {
    const response = await route.fetch()
    const body = (await response.text()).replace("<body ", '<body data-new-gr-c-s-check-loaded="14.1162.0" data-gr-ext-installed="" ')
    await route.fulfill({ response, body })
  })
  await page.goto("/")
  await expect(page.locator("body")).toHaveAttribute("data-gr-ext-installed", "")
  const vine = page.getByRole("button", { name: "Shake the autumn vine to release leaves" })
  await vine.focus()
  await vine.press("Enter")
  await expect(page.locator(".autumn-burst-leaf")).toHaveCount(12)
  expect(errors).toEqual([])
})

import { test as base, expect } from "@playwright/test"

// External services are outside this repo's control. Keep CI deterministic while
// checking the real embed URL and local UI, assets, and JavaScript below.
export const test = base.extend({
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

export { expect }

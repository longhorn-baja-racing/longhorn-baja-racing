import { test as base, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { createBundle, MIN_ITERATIONS, type HubBundle } from "../lib/hub/crypto.ts"
import { allRoles, buildRolePayload, codeForRole, type HubCodes, type HubSource } from "../lib/hub/schema.ts"
import { subteamIds } from "../lib/subteams.ts"

// Test-only codes and links. Real codes never live in the repository.
const codes: HubCodes = {
  general: "test-general-code-001",
  leads: "test-leads-code-0002",
  subteams: Object.fromEntries(subteamIds.map((id, index) => [id, `test-${id}-code-${index + 10}`])) as HubCodes["subteams"],
}

const link = (id: string, label: string, category: string, extra = {}) => ({ id, label, category, url: `https://example.com/${id}`, ...extra })
const source: HubSource = {
  general: [link("team-drive", "Team shared drive", "Drive", { description: "Meeting notes and onboarding." }), link("team-bom", "Vehicle BOM", "BOM")],
  leads: [link("officer-folder", "Officer folder", "Drive"), link("applicant-responses", "Applicant responses", "Recruiting")],
  subteams: {
    dynamics: [link("dynamics-cad", "Dynamics CAD folder", "Design")],
    software: [link("software-notes", "Software notes", "Notes")],
  },
} as HubSource

let bundle: HubBundle

const test = base.extend<{ hubPage: Page }>({
  hubPage: async ({ page }, runTest) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.route("**/hub/bundle.json", (route) => route.fulfill({ json: bundle }))
    await page.route("https://www.longhornsimracing.org/**", (route) => route.fulfill({ contentType: "image/svg+xml", body: "<svg xmlns='http://www.w3.org/2000/svg'/>" }))
    await runTest(page)
    expect(errors, "No browser exceptions").toEqual([])
  },
})

test.beforeAll(async () => {
  bundle = await createBundle(
    allRoles().map((role) => ({ code: codeForRole(codes, role), payload: buildRolePayload(source, role) })),
    MIN_ITERATIONS,
  )
})

async function unlock(page: Page, code: string, remember = true) {
  await page.getByLabel("Access code").fill(code)
  const checkbox = page.getByRole("checkbox", { name: /Remember this device/ })
  if ((await checkbox.isChecked()) !== remember) await checkbox.click()
  await page.getByRole("button", { name: "Unlock" }).click()
}

async function expectNoSeriousA11yViolations(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
  const serious = result.violations.filter((item) => item.impact === "serious" || item.impact === "critical")
  expect(serious.map((item) => ({ rule: item.id, nodes: item.nodes.map((node) => ({ target: node.target, message: node.failureSummary })) }))).toEqual([])
}

test("hub explains when it is not set up", async ({ hubPage: page }) => {
  await page.route("**/hub/bundle.json", (route) => route.fulfill({ status: 404, body: "Not found" }))
  await page.goto("/hub/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Team hub")
  await expect(page.getByRole("main").getByRole("status")).toContainText("not set up yet")
})

test("a wrong code shows a generic error and no resources", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await expectNoSeriousA11yViolations(page)
  await unlock(page, "definitely-not-a-code-99")
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("That code did not work. Check it and try again.", { timeout: 15_000 })
  await expect(page.getByLabel("Access code")).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByRole("main")).not.toContainText("Team shared drive")
})

test("show and hide toggles the code field", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  const field = page.getByLabel("Access code")
  await expect(field).toHaveAttribute("type", "password")
  await page.getByRole("button", { name: "Show" }).click()
  await expect(field).toHaveAttribute("type", "text")
  await expect(page.getByRole("button", { name: "Hide" })).toHaveAttribute("aria-pressed", "true")
})

test("a subteam code shows team resources and only that subteam", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await unlock(page, codes.subteams.dynamics)
  const main = page.getByRole("main")
  await expect(main.getByRole("heading", { name: "Welcome, Dynamics" })).toBeVisible({ timeout: 15_000 })
  await expect(main.getByRole("link", { name: /Team shared drive/ })).toHaveAttribute("href", "https://example.com/team-drive")
  await expect(main.getByRole("link", { name: /Team shared drive/ })).toHaveAttribute("target", "_blank")
  await expect(main.getByRole("heading", { name: "Dynamics resources" })).toBeVisible()
  await expect(main.getByRole("link", { name: /Dynamics CAD folder/ })).toBeVisible()
  await expect(main).not.toContainText("Software notes")
  await expect(main).not.toContainText("Applicant responses")
  await expect(main).not.toContainText("Officer folder")
  await expect(main.getByLabel("Subteam", { exact: true })).toHaveCount(0)
  await expectNoSeriousA11yViolations(page)
})

test("a subteam without links shows an empty state", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await unlock(page, codes.subteams.chassis)
  await expect(page.getByText("No Chassis resources have been added yet.")).toBeVisible({ timeout: 15_000 })
})

test("the general code shows team resources only", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await unlock(page, codes.general)
  const main = page.getByRole("main")
  await expect(main.getByRole("heading", { name: "Team resources", level: 2 })).toBeVisible({ timeout: 15_000 })
  await expect(main.getByRole("link", { name: /Vehicle BOM/ })).toBeVisible()
  await expect(main).not.toContainText("Dynamics CAD folder")
  await expect(main).not.toContainText("Applicant responses")
})

test("leads see leadership, recruiting, and a subteam selector", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await unlock(page, codes.leads)
  const main = page.getByRole("main")
  await expect(main.getByRole("heading", { name: "Leads dashboard" })).toBeVisible({ timeout: 15_000 })
  await expect(main.getByRole("link", { name: /Officer folder/ })).toBeVisible()
  const recruiting = main.getByRole("region", { name: "Recruiting" })
  await expect(recruiting.getByRole("link", { name: /Public application form/ })).toHaveAttribute("href", /docs.google.com\/forms/)
  await expect(recruiting.getByRole("link", { name: /Applicant responses/ })).toBeVisible()

  const select = main.getByLabel("Subteam", { exact: true })
  await expect(select).toHaveValue("powertrain")
  await expect(main.getByText("No Powertrain resources have been added yet.")).toBeVisible()
  await select.selectOption("software")
  await expect(main.getByRole("link", { name: /Software notes/ })).toBeVisible()
  await expect(main).not.toContainText("Dynamics CAD folder")
  await expectNoSeriousA11yViolations(page)

  // The session and the selected subteam survive a reload.
  await page.reload()
  await expect(main.getByRole("heading", { name: "Leads dashboard" })).toBeVisible()
  await expect(main.getByLabel("Subteam", { exact: true })).toHaveValue("software")
})

test("log out and switch team clear the session", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await unlock(page, codes.subteams.software)
  await expect(page.getByRole("heading", { name: "Welcome, Software" })).toBeVisible({ timeout: 15_000 })
  await page.reload()
  await expect(page.getByRole("heading", { name: "Welcome, Software" })).toBeVisible()

  await page.getByRole("button", { name: "Switch team" }).click()
  await expect(page.getByRole("main").getByRole("status")).toContainText("switch to")
  await unlock(page, codes.general)
  await expect(page.getByRole("heading", { name: "Team resources", level: 2 })).toBeVisible({ timeout: 15_000 })

  await page.getByRole("button", { name: "Log out" }).click()
  await expect(page.getByRole("main").getByRole("status")).toContainText("You are logged out")
  await page.reload()
  await expect(page.getByLabel("Access code")).toBeVisible()
  await expect(page.getByRole("main")).not.toContainText("Team shared drive")
})

test("not remembering the device locks again on reload", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await unlock(page, codes.general, false)
  await expect(page.getByRole("heading", { name: "Team resources", level: 2 })).toBeVisible({ timeout: 15_000 })
  await page.reload()
  await expect(page.getByLabel("Access code")).toBeVisible()
})

test("sessions expire after 30 days", async ({ hubPage: page }) => {
  const start = new Date("2030-01-01T12:00:00Z")
  await page.clock.install({ time: start })
  await page.goto("/hub/")
  await unlock(page, codes.general)
  await expect(page.getByRole("heading", { name: "Team resources", level: 2 })).toBeVisible({ timeout: 15_000 })

  await page.clock.setSystemTime(new Date(start.getTime() + 29 * 86_400_000))
  await page.reload()
  await expect(page.getByRole("heading", { name: "Team resources", level: 2 })).toBeVisible()

  await page.clock.setSystemTime(new Date(start.getTime() + 31 * 86_400_000))
  await page.reload()
  await expect(page.getByLabel("Access code")).toBeVisible()
})

test("a rotated code invalidates a saved session", async ({ hubPage: page }) => {
  await page.goto("/hub/")
  await unlock(page, codes.general)
  await expect(page.getByRole("heading", { name: "Team resources", level: 2 })).toBeVisible({ timeout: 15_000 })
  // A rebuild with fresh salts (what rotation does) must not reopen with the old key.
  const rotated = await createBundle(
    allRoles().map((role) => ({ code: codeForRole(codes, role), payload: buildRolePayload(source, role) })),
    MIN_ITERATIONS,
  )
  await page.route("**/hub/bundle.json", (route) => route.fulfill({ json: rotated }))
  await page.reload()
  await expect(page.getByLabel("Access code")).toBeVisible()
})

test("the footer links to the hub without exposing resources", async ({ hubPage: page }) => {
  await page.goto("/")
  await page.getByRole("contentinfo").getByRole("link", { name: "Team hub" }).click()
  await expect(page).toHaveURL(/\/hub\/$/)
  await expect(page.getByLabel("Access code")).toBeVisible()
  const html = await page.content()
  expect(html).not.toContain("example.com")
})

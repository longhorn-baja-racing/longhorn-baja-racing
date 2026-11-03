import assert from "node:assert/strict"
import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

// Run after npm run build; checks the actual GitHub Pages export.
const routes = ["", "about", "subteams", "members", "calendar", "merch", "sponsors", "contact"]
const titles = new Set()
for (const route of routes) {
  const html = readFileSync(join("out", route, "index.html"), "utf8")
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route + ": one page heading")
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]
  assert.ok(title, route + ": title")
  assert.ok(!titles.has(title), route + ": unique title")
  titles.add(title)
  const canonical = "https://longhornbajaracing.com/" + (route ? route + "/" : "")
  assert.ok(html.includes('rel="canonical" href="' + canonical + '"'), route + ": canonical")
  assert.equal((html.match(/<iframe[ >]/g) || []).length, 0, route + ": no iframes")
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (href.startsWith("//")) continue
    const pathname = decodeURIComponent(href.split(/[?#]/)[0])
    const file = join("out", pathname)
    assert.ok(existsSync(file), route + ": missing asset or link " + pathname)
    if (statSync(file).isDirectory()) assert.ok(existsSync(join(file, "index.html")), pathname)
  }
}
const calendar = JSON.parse(readFileSync("out/data/calendar.json", "utf8"))
assert.ok(calendar.status === "ok" || calendar.status === "unavailable", "calendar data status")
assert.equal(calendar.timeZone, "America/Chicago")
assert.ok(Array.isArray(calendar.events), "calendar events list")
if (calendar.status === "unavailable") console.warn("Warning: calendar feed was unavailable at build time; the page shows its fallback.")
assert.ok(statSync("public/baja-team-photo-mobile.webp").size < 150000)
assert.ok(statSync("public/baja-team-photo.webp").size < 500000)
console.log("Passed: 8 exported pages, headings, metadata, local links/assets, calendar data, image budgets.")


import assert from "node:assert/strict"
import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

// Run after npm run build; checks the actual GitHub Pages export.

/** Every JSON-LD item on a page, with arrays and @graph lists flattened. */
function jsonLdItems(html, route) {
  const items = []
  for (const [, body] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let value
    try {
      value = JSON.parse(body)
    } catch (error) {
      assert.fail(route + ": JSON-LD does not parse: " + error.message)
    }
    const list = Array.isArray(value) ? value : value["@graph"] ?? [value]
    items.push(...list)
  }
  return items
}

const routes = ["", "about", "subteams", "members", "calendar", "merch", "sponsors", "contact"]
const titles = new Set()
const eventsByRoute = new Map()
for (const route of routes) {
  const html = readFileSync(join("out", route, "index.html"), "utf8")
  const items = jsonLdItems(html, route)
  assert.equal(items.filter((item) => item["@type"] === "Organization").length, 1, route + ": Organization JSON-LD")
  eventsByRoute.set(route, items.filter((item) => item["@type"] === "Event"))
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

// Event structured data: only on /calendar/, built from the same feed.
for (const [route, events] of eventsByRoute) if (route !== "calendar") assert.equal(events.length, 0, route + ": no Event JSON-LD")
const events = eventsByRoute.get("calendar")
const when = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})?$/
assert.ok(events.length <= 20, "calendar: at most 20 Event items")
for (const event of events) {
  assert.ok(typeof event.name === "string" && event.name.trim(), "calendar: Event name")
  assert.match(event.startDate, when, "calendar: Event startDate " + event.startDate)
  assert.match(event.endDate, when, "calendar: Event endDate " + event.endDate)
  assert.ok(event.endDate.slice(0, 10) >= event.startDate.slice(0, 10), "calendar: Event ends after it starts")
  assert.equal(event.organizer?.url, "https://longhornbajaracing.com", "calendar: Event organizer")
}
if (calendar.status === "unavailable") assert.equal(events.length, 0, "calendar: no Event JSON-LD without data")
const placeholder = /^(untitled event|busy|private( event)?)$/i
const soon = calendar.events.some((event) => !placeholder.test(event.title) && Date.parse(event.end) > Date.now() + 86_400_000)
if (calendar.status === "ok" && soon) assert.ok(events.length > 0, "calendar: Event JSON-LD for upcoming events")
assert.ok(statSync("public/baja-team-photo-mobile.webp").size < 150000)
assert.ok(statSync("public/baja-team-photo.webp").size < 500000)
console.log("Passed: 8 exported pages, headings, metadata, local links/assets, calendar data, " + events.length + " Event JSON-LD items, image budgets.")


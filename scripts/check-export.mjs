import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

// Run after npm run build; checks the actual GitHub Pages export.
const pages = ["", "merch", "calendar"]
// Former standalone pages that now forward to a section of the one-page home.
const moved = { about: "about", subteams: "subteams", members: "members", sponsors: "sponsors", contact: "contact" }
const sections = ["about", "subteams", "members", "sponsors", "merch", "calendar", "contact"]

const read = (route) => readFileSync(join("out", route, "index.html"), "utf8")
const titles = new Set()

function checkLocalLinks(route, html) {
  for (const [, href] of html.matchAll(/(?:href|src|srcSet)="(\/[^"]*)"/g)) {
    if (href.startsWith("//")) continue
    const pathname = decodeURIComponent(href.split(/[?#]/)[0])
    const file = join("out", pathname)
    assert.ok(existsSync(file), route + ": missing asset or link " + pathname)
    if (statSync(file).isDirectory()) assert.ok(existsSync(join(file, "index.html")), pathname)
  }
}

for (const route of pages) {
  const html = read(route)
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route + ": one page heading")
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]
  assert.ok(title, route + ": title")
  assert.ok(!titles.has(title), route + ": unique title")
  titles.add(title)
  const canonical = "https://longhornbajaracing.com/" + (route ? route + "/" : "")
  assert.ok(html.includes('rel="canonical" href="' + canonical + '"'), route + ": canonical")
  assert.ok(!html.includes("noindex"), route + ": indexable")
  // The home page loads the agenda only on request; the calendar page embeds it.
  assert.equal((html.match(/<iframe[ >]/g) || []).length, route === "calendar" ? 1 : 0, route + ": iframes")
  checkLocalLinks(route, html)
}

const home = read("")
for (const id of sections) assert.ok(home.includes('id="' + id + '"'), "home: #" + id + " section")
for (const id of ["powertrain", "dynamics", "chassis", "ergonomics", "electronics", "software", "public-relations", "business", "corporate-relations", "logistics"]) {
  assert.ok(home.includes('data-shot="' + id + '"'), "home: 3D shot for " + id)
}

for (const [route, section] of Object.entries(moved)) {
  const html = read(route)
  assert.ok(html.includes('http-equiv="refresh" content="0; url=/#' + section + '"'), route + ": forwards to /#" + section)
  assert.ok(html.includes('content="noindex, follow"'), route + ": not indexed")
  assert.ok(html.includes('rel="canonical" href="https://longhornbajaracing.com/"'), route + ": canonical home")
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route + ": one page heading")
  checkLocalLinks(route, html)
}

const sitemap = readFileSync("out/sitemap.xml", "utf8")
for (const route of pages) assert.ok(sitemap.includes("<loc>https://longhornbajaracing.com/" + (route ? route + "/" : "") + "</loc>"), "sitemap: " + route)
for (const route of Object.keys(moved)) assert.ok(!sitemap.includes("/" + route + "/<"), "sitemap omits " + route)

const calendar = read("calendar")
assert.match(calendar, /src=longhornbaja%40gmail.com/)
assert.match(calendar, /ctz=America%2FChicago/)
assert.match(calendar, /mode=AGENDA/)
assert.match(calendar, /loading="lazy"/)

// three.js must stay out of the HTML's initial scripts (it loads on idle).
const chunks = join("out", "_next", "static", "chunks")
const threeChunk = readdirSync(chunks).find((f) => f.endsWith(".js") && readFileSync(join(chunks, f), "utf8").includes("WebGLRenderer"))
assert.ok(threeChunk, "three.js chunk exists")
assert.ok(!home.includes(threeChunk), "three.js is not render-blocking")

assert.ok(statSync("public/baja-team-photo-mobile.webp").size < 150000)
assert.ok(statSync("public/baja-team-photo.webp").size < 500000)
assert.ok(statSync("public/baja-action-mobile.webp").size < 150000)
assert.ok(statSync("public/baja-action.webp").size < 350000)
console.log("Passed: 3 pages, 5 forwarding pages, sections, metadata, local links/assets, sitemap, calendar, lazy 3D, image budgets.")

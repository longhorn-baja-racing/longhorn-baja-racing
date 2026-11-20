import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

// Run after npm run build; checks the actual GitHub Pages export.
const site = "https://longhornbajaracing.com/"
const decode = (text) => text.replace(/&(amp|quot|#x27|#39|lt|gt);/g, (_, entity) => ({ amp: "&", quot: '"', "#x27": "'", "#39": "'", lt: "<", gt: ">" })[entity])
const meta = (html, key) =>
  [...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].filter(([, name]) => name === key).map(([, , value]) => decode(value))
// Reads width and height from a baseline or progressive JPEG start-of-frame marker.
const jpegSize = (file) => {
  const data = readFileSync(file)
  assert.ok(data[0] === 0xff && data[1] === 0xd8, file + ": not a JPEG")
  for (let i = 2; i < data.length; ) {
    const marker = data[i + 1]
    const length = data.readUInt16BE(i + 2)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: data.readUInt16BE(i + 5), width: data.readUInt16BE(i + 7) }
    }
    i += 2 + length
  }
  throw new Error(file + ": no JPEG frame header")
}
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
  assert.equal((html.match(/<iframe[ >]/g) || []).length, route === "calendar" ? 1 : 0)
  // Social previews: every page needs its own complete Open Graph and Twitter tags.
  const one = (key) => {
    const values = meta(html, key)
    assert.equal(values.length, 1, route + ": exactly one " + key)
    assert.ok(values[0], route + ": empty " + key)
    return values[0]
  }
  const pageTitle = decode(title)
  const description = one("description")
  assert.equal(one("og:title"), pageTitle, route + ": og:title matches title")
  assert.equal(one("twitter:title"), pageTitle, route + ": twitter:title matches title")
  assert.equal(one("og:description"), description, route + ": og:description matches description")
  assert.equal(one("twitter:description"), description, route + ": twitter:description matches description")
  assert.equal(one("og:url"), canonical, route + ": og:url matches canonical")
  assert.equal(one("og:site_name"), "Longhorn Baja Racing", route + ": og:site_name")
  assert.equal(one("og:type"), "website", route + ": og:type")
  assert.equal(one("og:locale"), "en_US", route + ": og:locale")
  assert.equal(one("twitter:card"), "summary_large_image", route + ": twitter:card")
  one("og:image:alt")
  const image = one("og:image")
  assert.equal(one("twitter:image"), image, route + ": twitter:image matches og:image")
  assert.ok(image.startsWith(site), route + ": og:image is an absolute site URL " + image)
  const imageFile = join("out", decodeURIComponent(new URL(image).pathname))
  assert.ok(existsSync(imageFile), route + ": missing og:image file " + imageFile)
  assert.deepEqual(jpegSize(imageFile), { width: Number(one("og:image:width")), height: Number(one("og:image:height")) }, route + ": og:image size")
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (href.startsWith("//")) continue
    const pathname = decodeURIComponent(href.split(/[?#]/)[0])
    const file = join("out", pathname)
    assert.ok(existsSync(file), route + ": missing asset or link " + pathname)
    if (statSync(file).isDirectory()) assert.ok(existsSync(join(file, "index.html")), pathname)
  }
}
const calendar = readFileSync("out/calendar/index.html", "utf8")
assert.match(calendar, /src=longhornbaja%40gmail.com/)
assert.match(calendar, /ctz=America%2FChicago/)
assert.match(calendar, /mode=AGENDA/)
assert.match(calendar, /loading="lazy"/)
assert.ok(statSync("public/baja-team-photo-mobile.webp").size < 150000)
assert.ok(statSync("public/baja-team-photo.webp").size < 500000)
const shareImages = readdirSync("public/og")
assert.ok(shareImages.length > 0, "public/og share images")
for (const name of shareImages) {
  assert.match(name, /\.jpg$/, "public/og/" + name + ": JPEG only")
  assert.ok(statSync(join("public/og", name)).size < 250000, "public/og/" + name + ": under 250 KB")
  assert.deepEqual(jpegSize(join("public/og", name)), { width: 1200, height: 630 }, "public/og/" + name + ": 1200x630")
}
console.log("Passed: 8 exported pages, headings, metadata, social tags, local links/assets, calendar, image budgets.")


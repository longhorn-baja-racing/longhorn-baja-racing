// Trims empty margins from sponsor logos and writes web-ready WebP files.
//
//   node scripts/normalize-sponsor-logos.mjs public/sponsors/new-logo.png [...]
//
// For each input it writes <name>.webp next to it (trimmed, at most 520x160,
// alpha kept) and prints the size to enter as width/height in
// components/sponsors.tsx, which uses it to give every logo a similar visual
// weight. Uses the sharp copy that Next.js installs. SVG logos need no
// processing: use the viewBox size.

import { basename, dirname, extname, join } from "node:path"
import sharp from "sharp"

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error("Usage: node scripts/normalize-sponsor-logos.mjs <logo files...>")
  process.exit(2)
}

for (const file of files) {
  const out = join(dirname(file), basename(file, extname(file)) + ".webp")
  // Trim margins that match the corner color (transparent or a flat background).
  const trimmed = await sharp(file).trim({ threshold: 12 }).toBuffer()
  const { width, height, size } = await sharp(trimmed)
    .resize({ width: 520, height: 160, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(out === file ? out + ".tmp.webp" : out)
  console.log(`${basename(out)}  width: ${width}, height: ${height}  (${(size / 1024).toFixed(1)} KB)`)
}

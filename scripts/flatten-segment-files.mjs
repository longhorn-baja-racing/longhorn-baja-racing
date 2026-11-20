import { existsSync } from "node:fs"
import { readdir, rename, rm } from "node:fs/promises"
import { join, relative, sep } from "node:path"

// Runs after next build. Next 16 exports one prefetch file per route segment,
// named after the segment path with "/" turned into ".", for example
// out/about/__next.about.__PAGE__.txt, and the client router requests exactly
// that flat name. On Windows, next build collects segment paths with
// path.relative(), which returns backslashes, and then only converts "/", so
// the file is written to out/about/__next.about/__PAGE__.txt instead and every
// prefetch of it is a 404 (vercel/next.js#85374, unfixed as of 16.4.6; fix
// proposed in vercel/next.js#92340). This moves such nested files back to
// their flat names. Linux and macOS builds have no __next.* directories, so
// there this finds nothing and changes nothing. Remove it once Next ships
// the fix.
const root = process.argv[2] || "out"
let moved = 0

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const path = join(dir, entry.name)
    if (entry.name.startsWith("__next.")) await flatten(dir, path)
    else await walk(path)
  }
}

async function flatten(parent, nested) {
  for (const entry of await readdir(nested, { withFileTypes: true, recursive: true })) {
    if (entry.isDirectory()) continue
    const file = join(entry.parentPath, entry.name)
    const flat = join(parent, relative(parent, file).split(sep).join("."))
    if (existsSync(flat)) throw new Error("Refusing to overwrite " + flat)
    await rename(file, flat)
    moved++
  }
  // Only the now-empty directories are left.
  await rm(nested, { recursive: true })
}

await walk(root)
if (moved) console.log("Flattened " + moved + " nested RSC segment files in " + root + "/")

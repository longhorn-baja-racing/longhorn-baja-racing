import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { resolve, sep, extname } from "node:path"

const root = resolve("out")
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".avif": "image/avif", ".svg": "image/svg+xml", ".woff2": "font/woff2" }
createServer(async (request, response) => {
  try {
    let file = resolve(root, "." + decodeURIComponent(new URL(request.url, "http://localhost").pathname))
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end()
      return
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html")
    const content = await readFile(file)
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" }).end(content)
  } catch {
    response.writeHead(404).end("Not found")
  }
}).listen(4173, "127.0.0.1", () => console.log("Serving production export on port 4173"))

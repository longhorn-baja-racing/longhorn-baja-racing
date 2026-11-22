import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"

export const dynamic = "force-static"

// Old section pages (/about/, /members/, ...) forward to the home page and are not listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/merch/", "/calendar/"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.6,
    images: [`${siteConfig.url}${siteConfig.socialImage}`],
  }))
}

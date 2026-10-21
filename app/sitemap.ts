import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about/", "/subteams/", "/members/", "/calendar/", "/merch/", "/sponsors/", "/contact/"].map((path) => (
    {
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: path === "" ? 1 : 0.7,
      images: [`${siteConfig.url}${siteConfig.socialImage}`],
    }
  ))
}

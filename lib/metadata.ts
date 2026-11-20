import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export type ShareImage = {
  /** Path under public/, resolved against metadataBase. */
  url: string
  alt: string
}

// 1200x630 JPEGs in public/og/, cropped from existing site photos.
// scripts/check-export.mjs enforces the size budget and dimensions.
export const shareImageSize = { width: 1200, height: 630 } as const

export const shareImages = {
  team: { url: "/og/team.jpg", alt: "Longhorn Baja Racing team members standing together on a race track" },
  subteams: { url: "/og/subteams.jpg", alt: "CAD render of the Longhorn Baja Racing vehicle frame and suspension" },
  members: { url: "/og/members.jpg", alt: "Longhorn Baja Racing member sitting on the team's orange off-road vehicle" },
  merch: { url: "/og/merch.jpg", alt: "Longhorn Baja Racing hoodie and t-shirts" },
  sponsors: { url: "/og/sponsors.jpg", alt: "Longhorn Baja Racing members with the vehicle in front of a sponsor banner" },
  calendar: { url: "/og/calendar.jpg", alt: "Longhorn Baja Racing vehicle airborne over a dirt jump at competition" },
} as const satisfies Record<string, ShareImage>

export const titleTemplate = `%s | ${siteConfig.name}`

type PageMetadataInput = {
  /** Short page title; the layout template appends the site name. Omit for the home page. */
  title?: string
  description: string
  /** Route path with leading and trailing slash, for example "/about/". */
  path: string
  image?: ShareImage
}

/**
 * Builds complete metadata for one page. Next replaces nested objects such as
 * openGraph and twitter instead of merging them with the layout, so every page
 * must set all of their fields itself.
 */
export function pageMetadata({ title, description, path, image = shareImages.team }: PageMetadataInput): Metadata {
  if (!/^\/(?:[a-z0-9-]+\/)*$/.test(path)) {
    throw new Error(`pageMetadata: path must start and end with "/": ${path}`)
  }
  const fullTitle = title ? titleTemplate.replace("%s", title) : siteConfig.title

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      url: path,
      title: fullTitle,
      description,
      images: [{ url: image.url, ...shareImageSize, alt: image.alt, type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  }
}

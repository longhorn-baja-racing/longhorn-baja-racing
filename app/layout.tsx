import type React from "react"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"
import { pageMetadata, titleTemplate } from "@/lib/metadata"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

import "./globals.css"
import { Bebas_Neue, Bitter, Montserrat, IBM_Plex_Mono } from "next/font/google"

const autumn = Bitter({ subsets: ["latin"], variable: "--font-autumn", display: "swap" })

// Fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
})
const display = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" })

export const metadata: Metadata = {
  // Defaults for the home page and any route without its own metadata.
  ...pageMetadata({ description: siteConfig.description, path: "/" }),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: titleTemplate,
  },
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [...siteConfig.keywords],
  category: "Engineering",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
  icon: {
    url: "/favicon.png",
    type: "image/png",
    sizes: "512x512",
  },
  apple: "/apple-icon.png",
},
  manifest: "/manifest.json",
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  alternateName: [siteConfig.shortName, "UT Austin Baja SAE"],
  url: siteConfig.url,
  logo: `${siteConfig.url}${siteConfig.logo}`,
  image: `${siteConfig.url}${siteConfig.socialImage}`,
  description: siteConfig.description,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Austin",
    addressRegion: "TX",
    addressCountry: "US",
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: siteConfig.university,
    url: "https://www.utexas.edu/",
  },
  sameAs: siteConfig.socialLinks,
  knowsAbout: [
    "Baja SAE",
    "Off-road vehicle design",
    "Automotive engineering",
    "Mechanical engineering",
    "Student motorsports",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        {/* Browser extensions such as Grammarly add body attributes before hydration.
            Limit suppression to this element; descendants still report mismatches. */}
        <body suppressHydrationWarning className={`${montserrat.variable} ${mono.variable} ${display.variable} ${autumn.variable} font-sans antialiased`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="min-h-[65vh] outline-none">{children}</main>
        <Footer />
        </body>
      </html>
  )
}

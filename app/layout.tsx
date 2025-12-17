import type React from "react"
import type { Metadata } from "next"

import "./globals.css"
import { Inter as V0_Font_Inter, Geist_Mono as V0_Font_Geist_Mono } from "next/font/google"

// Fonts
const _inter = V0_Font_Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Longhorn Baja Racing",
  description: "The Baja SAE club for UT Austin",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body className={`font-sans antialiased`}>
        {children}
        </body>
      </html>
  )
}

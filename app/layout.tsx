import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { FacebookPixel } from "@/components/tracking/facebook-pixel"
import { GoFunnelTracking } from "@/components/tracking/gofunnel-tracking"
import config from "@/lib/config"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: config.metaTitle || `${config.companyName} | Sell Your House Fast For Cash`,
  description:
    config.metaDescription ||
    "Get a fair cash offer for your home in 24 hours. No fees, no repairs.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${plusJakartaSans.className}`}>
        <GoFunnelTracking />
        <FacebookPixel />
        {children}
        <Analytics />
      </body>
    </html>
  )
}

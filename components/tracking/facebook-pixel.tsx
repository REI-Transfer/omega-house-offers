"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || ""

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: (...args: unknown[]) => void
  }
}

export function FacebookPixel() {
  const pathname = usePathname()

  useEffect(() => {
    if (!FB_PIXEL_ID) return
    if (window.fbq) return

    const n = (window.fbq = function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-rest-params
      n.callMethod ? n.callMethod.apply(n, arguments as any) : n.queue.push(arguments)
    } as any)
    if (!window._fbq) window._fbq = n
    n.push = n
    n.loaded = !0
    n.version = "2.0"
    n.queue = []
    const t = document.createElement("script")
    t.async = true
    t.src = "https://connect.facebook.net/en_US/fbevents.js"
    const s = document.getElementsByTagName("script")[0]
    s?.parentNode?.insertBefore(t, s)

    window.fbq("init", FB_PIXEL_ID)
  }, [])

  useEffect(() => {
    if (!FB_PIXEL_ID) return
    if (window.fbq) {
      window.fbq("track", "PageView")
    }
  }, [pathname])

  if (!FB_PIXEL_ID) return null

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}

"use client"
import { useEffect } from "react"

export function LeadEvent() {
  useEffect(() => {
    // Suppress the real Meta "Lead" event for excellent / move-in-ready
    // condition leads. The survey-card persists the chosen condition before
    // redirecting here. These leads are still captured by the client (the
    // /api/submit fetch runs unconditionally); we only skip the pixel event.
    let condition = ""
    try {
      condition = sessionStorage.getItem("lead_condition") || ""
    } catch {}
    if (condition === "excellent") {
      // Fire a low-intent custom event instead so we still have signal,
      // but never the conversion-optimized "Lead" event.
      const fireLowIntent = () => {
        if (typeof window !== "undefined" && window.fbq) {
          window.fbq("trackCustom", "LeadLowIntent", { disqualify_reason: "excellent_condition" })
          return true
        }
        return false
      }
      if (fireLowIntent()) return
      const lowInterval = setInterval(() => {
        if (fireLowIntent()) clearInterval(lowInterval)
      }, 200)
      const lowTimeout = setTimeout(() => clearInterval(lowInterval), 10000)
      return () => {
        clearInterval(lowInterval)
        clearTimeout(lowTimeout)
      }
    }

    const fire = () => {
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Lead")
        return true
      }
      return false
    }

    if (fire()) return

    const interval = setInterval(() => {
      if (fire()) clearInterval(interval)
    }, 200)

    const timeout = setTimeout(() => clearInterval(interval), 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return null
}

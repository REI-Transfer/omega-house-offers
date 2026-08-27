"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Phone, Clock, Shield } from "lucide-react"
import { FooterLinks } from "@/components/polar/footer-links"
import type { Brand } from "@/lib/brand"

// Optional media/book-offer env (per-client, disabled by default).
const heroVideoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || ""
const bookCoverUrl = process.env.NEXT_PUBLIC_BOOK_COVER_URL || ""

export function ThankYouContent({ brand }: { brand: Brand }) {
  const ownerLabel = brand.ownerName || brand.companyName
  const [bookEmail, setBookEmail] = useState("")
  const [leadFirstName, setLeadFirstName] = useState("")
  const [leadLastName, setLeadLastName] = useState("")
  const [leadPhone, setLeadPhone] = useState("")
  const [leadAddress, setLeadAddress] = useState("")
  const [leadCity, setLeadCity] = useState("")
  const [leadState, setLeadState] = useState("")
  const [leadZip, setLeadZip] = useState("")
  const [bookSubmitted, setBookSubmitted] = useState(false)
  const [bookSubmitting, setBookSubmitting] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('leadData')
      if (stored) {
        const data = JSON.parse(stored)
        setBookEmail(data.email || "")
        setLeadFirstName(data.firstName || "")
        setLeadLastName(data.lastName || "")
        setLeadPhone(data.phone || "")
        setLeadAddress(data.address || "")
        setLeadCity(data.city || "")
        setLeadState(data.state || "")
        setLeadZip(data.zip || "")
      }
    } catch {}
  }, [])

  const handleBookRequest = async () => {
    if (!bookEmail.trim() || bookSubmitting) return
    setBookSubmitting(true)
    try {
      await fetch('/api/book-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bookEmail, firstName: leadFirstName, lastName: leadLastName, phone: leadPhone,
          address: leadAddress, city: leadCity, state: leadState, zip: leadZip,
        }),
      })
      setBookSubmitted(true)
    } catch {
      // Fail silently — book offer is supplementary
    } finally {
      setBookSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-gray-50">
      <div className="py-8 md:py-16" style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--brand-accent) 10%, transparent), transparent)" }}>
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/10">
            <CheckCircle2 className="h-8 w-8 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl text-balance">Thank You for Your Submission!</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            We will be in touch within 24 hours with your cash offer.
          </p>
        </div>
      </div>

      {heroVideoUrl && (
        <section className="bg-white px-6 py-6 md:py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F1D2F] mb-2 text-center">See How It Works</h2>
            <p className="text-center text-[#5A6B7D] text-lg mb-8">
              Watch how {brand.companyName} makes selling your home fast and stress-free.
            </p>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-[#E2E8F0]">
              <video src={heroVideoUrl} autoPlay muted loop playsInline controls className="w-full" style={{ aspectRatio: "16/9", objectFit: "cover" }} />
            </div>
          </div>
        </section>
      )}

      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What Happens Next</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--brand-accent) 10%, transparent)" }}>
                <Clock className="h-6 w-6 text-[color:var(--brand-accent)]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">We Review Your Info</h3>
              <p className="text-sm text-gray-600">Our team analyzes your property details and local market data.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--brand-accent) 10%, transparent)" }}>
                <Phone className="h-6 w-6 text-[color:var(--brand-accent)]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">We Call You</h3>
              <p className="text-sm text-gray-600">A team member will reach out within 24 hours with your fair cash offer.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--brand-accent) 10%, transparent)" }}>
                <Shield className="h-6 w-6 text-[color:var(--brand-accent)]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">You Decide</h3>
              <p className="text-sm text-gray-600">No pressure, no obligation. Accept only if the offer works for you.</p>
            </div>
          </div>
        </div>
      </div>

      {bookCoverUrl && (
        <section className="bg-[#F5F7FA] py-10 md:py-14">
          <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-200">
              {bookSubmitted ? (
                <div className="text-center">
                  <CheckCircle2 className="h-10 w-10 text-[#22c55e] mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900">Check Your Inbox!</h3>
                  <p className="mt-2 text-gray-600">We&apos;re sending your free guide to <strong>{bookEmail}</strong>. It should arrive within a few minutes.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-5">
                  <img src={bookCoverUrl} alt={`${ownerLabel} — Free Guide`} className="h-80 md:h-96 w-auto drop-shadow-xl" />
                  <div className="text-center w-full">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Get {ownerLabel}&apos;s Free Guide</h3>
                    <p className="mt-2 text-gray-600 text-sm md:text-base max-w-md mx-auto">
                      Learn the insider secrets to selling your home fast for top dollar — no agents, no fees, no repairs needed.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <input type="email" value={bookEmail} onChange={(e) => setBookEmail(e.target.value)} placeholder="Your email address"
                        className="flex-1 h-12 px-4 rounded-xl border border-gray-300 text-base bg-white focus:outline-none focus:ring-2 focus:border-[color:var(--brand-accent)] !text-black" />
                      <button onClick={handleBookRequest} disabled={bookSubmitting || !bookEmail.trim()}
                        className="h-12 px-6 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                        style={{ backgroundColor: "var(--brand-accent)" }}>
                        {bookSubmitting ? "Sending..." : "Get the Guide Now"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="bg-white py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Have Questions?</h2>
          <p className="mt-2 text-gray-600">Our team is ready to help you every step of the way.</p>
          {brand.phoneDisplay && (
            <a href={`tel:${brand.phoneHref}`} className="mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 text-lg font-semibold text-white transition-colors" style={{ backgroundColor: "var(--brand-accent)" }}>
              <Phone className="h-5 w-5" />
              Call {brand.phoneDisplay}
            </a>
          )}
        </div>
      </div>

      <div className="relative z-10 py-8">
        <FooterLinks brand={brand} />
      </div>

    </main>
  )
}

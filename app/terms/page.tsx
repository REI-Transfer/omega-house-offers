import { Metadata } from "next"
import Link from "next/link"
import config from "@/lib/config"
import { buildBrand } from "@/lib/brand"
import { FooterLinks } from "@/components/polar/footer-links"

export const metadata: Metadata = {
  title: `${config.companyName} — Terms of Service`,
}

export default function TermsPage() {
  const brand = buildBrand()
  return (
    <main className="min-h-screen bg-white" style={{ ["--brand-accent" as string]: brand.accentColor }}>
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.companyName} className="h-16 w-auto" />
            ) : (
              <span className="text-lg font-bold text-[#0F1D2F]">{brand.companyName}</span>
            )}
          </Link>
          <Link href="/" className="text-sm font-medium text-[color:var(--brand-accent)] hover:opacity-80 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-[#0F1D2F] mb-2">{brand.companyName} Terms of Service</h1>
        <p className="text-sm text-[#5A6B7D] mb-10">Please review the terms governing use of this website.</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">1. Acceptance of Terms</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            By accessing our website or submitting a property inquiry, you agree to be bound by these Terms of Service
            and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            These terms are governed by the applicable laws of the jurisdiction in which the Company operates.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">2. Services Description</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            {brand.companyName} is a real estate investment company that makes cash offers to purchase residential properties.
            Submitting a property inquiry does not obligate either party to complete a transaction. Any offer made is
            subject to due diligence, property inspection, and final approval. This website does not constitute an offer
            to purchase real estate.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">3. User Representations</h2>
          <p className="text-[#5A6B7D] leading-relaxed mb-3">By submitting a property inquiry, you represent that:</p>
          <ul className="list-disc pl-6 space-y-2 text-[#5A6B7D]">
            <li>You are at least 18 years of age</li>
            <li>You have the legal authority to sell the property or are an authorized representative</li>
            <li>The information you provide is accurate and complete</li>
            <li>You are not currently under a listing agreement with a real estate agent for the submitted property</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">4. No Obligation</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            Submitting an inquiry creates no obligation for {brand.companyName} to purchase your property, nor does it
            create any obligation for you to sell. We reserve the right to decline any inquiry at our sole discretion.
            Individual results vary. Past performance is not indicative of future results.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">5. Intellectual Property</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            All content on this website, including text, graphics, logos, and images, is the property of {brand.companyName}
            and is protected by applicable copyright and trademark laws. You may not reproduce, distribute, or create
            derivative works without our prior written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">6. Limitation of Liability</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            To the maximum extent permitted by law, {brand.companyName} shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising from your use of our website or services. Our total
            liability shall not exceed one hundred dollars ($100).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">7. Governing Law</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            These Terms of Service shall be governed by and construed in accordance with the applicable laws of the
            jurisdiction in which the Company operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">8. Changes to Terms</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting
            to our website. Your continued use of our services after any changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#0F1D2F] mb-3">9. Contact</h2>
          <p className="text-[#5A6B7D] leading-relaxed">
            For questions about these Terms of Service, contact {brand.companyName}
            {brand.phoneDisplay ? <> at <a href={`tel:${brand.phoneHref}`} className="text-[color:var(--brand-accent)] hover:underline">{brand.phoneDisplay}</a></> : null}.
          </p>
        </section>
      </div>

      <FooterLinks brand={brand} />
    </main>
  )
}

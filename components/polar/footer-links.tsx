import Link from "next/link"
import type { Brand } from "@/lib/brand"

export function FooterLinks({ brand }: { brand: Brand }) {
  return (
    <footer className="bg-white px-4 lg:px-8">
      <div className="mx-auto max-w-7xl border-t border-gray-200 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.companyName} className="h-20 w-auto" />
          ) : (
            <span className="text-xl font-bold text-[#0F1D2F]">{brand.companyName}</span>
          )}
          <p className="text-sm text-gray-500">We buy houses in any condition. No obligation, no pressure.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="transition-colors hover:text-gray-900">Privacy Policy</Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="transition-colors hover:text-gray-900">Terms of Service</Link>
            {brand.phoneDisplay && (
              <>
                <span className="text-gray-300">|</span>
                <a href={`tel:${brand.phoneHref}`} className="transition-colors hover:text-gray-900">{brand.phoneDisplay}</a>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} {brand.companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

import { buildBrand } from "@/lib/brand"
import { ThankYouContent } from "@/components/thank-you-content"

export default function ThankYouPage() {
  const brand = buildBrand()
  return (
    <div style={{ ["--brand-accent" as string]: brand.accentColor }}>
      <ThankYouContent brand={brand} />
    </div>
  )
}

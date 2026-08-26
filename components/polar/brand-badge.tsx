import { Home } from "lucide-react"

export function BrandBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-md">
      <Home className="h-5 w-5 text-emerald-400" />
      <span className="text-sm font-medium text-white">Quick Home Buyers</span>
    </div>
  )
}

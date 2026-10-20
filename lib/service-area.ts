/**
 * lib/service-area.ts — client-safe service-area gate.
 *
 * Reads NEXT_PUBLIC_SERVICE_AREAS, a JSON array of circles:
 *   [{ "lat": 40.7608, "lng": -111.8910, "radiusMiles": 30 }, ...]
 * (aliases accepted: latitude/longitude, radius_miles/radius).
 *
 * When the list is empty / missing / unparseable, the gate is PERMISSIVE —
 * every address is accepted (no geo-lock). This replaces the old hardcoded
 * Salt Lake bounding box + county allow-list so the template ships area-agnostic.
 */

export interface ServiceCircle {
  lat: number
  lng: number
  radiusMiles: number
}

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number)
  return typeof n === "number" && Number.isFinite(n) ? n : undefined
}

export function parseServiceAreas(raw?: string): ServiceCircle[] {
  const src = raw ?? process.env.NEXT_PUBLIC_SERVICE_AREAS ?? ""
  if (!src.trim()) return []
  try {
    const parsed = JSON.parse(src)
    if (!Array.isArray(parsed)) return []
    const circles: ServiceCircle[] = []
    for (const c of parsed) {
      if (!c || typeof c !== "object") continue
      const lat = num((c as any).lat ?? (c as any).latitude)
      const lng = num((c as any).lng ?? (c as any).longitude ?? (c as any).lon)
      const radiusMiles = num((c as any).radiusMiles ?? (c as any).radius_miles ?? (c as any).radius)
      if (lat === undefined || lng === undefined || radiusMiles === undefined) continue
      circles.push({ lat, lng, radiusMiles })
    }
    return circles
  } catch {
    return []
  }
}

function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const lat1 = (aLat * Math.PI) / 180
  const lat2 = (bLat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Returns true when the point is inside the configured service area.
 * Permissive (true) when no areas are configured, or when lat/lng are unknown
 * (we never block a lead we can't geolocate).
 */
export function isWithinServiceArea(
  lat?: number,
  lng?: number,
  raw?: string
): boolean {
  const circles = parseServiceAreas(raw)
  if (circles.length === 0) return true
  if (lat === undefined || lng === undefined) return true
  return circles.some((c) => haversineMiles(lat, lng, c.lat, c.lng) <= c.radiusMiles)
}

/**
 * Optional county gate. NEXT_PUBLIC_ALLOWED_COUNTIES lists "ST:County" pairs,
 * comma-separated, e.g. "CA:Los Angeles,CA:Orange,VA:Richmond city".
 * "CA:*" accepts the whole state; a bare "County" (no "ST:") matches that name in any state.
 * Use it when the ads target whole counties, so the form accepts exactly what
 * the ads pay to reach (the mirror rule).
 * Counties only: the counties are the gate (as before). Counties AND circles
 * (NEXT_PUBLIC_SERVICE_AREAS): an address passes inside ANY circle OR in ANY listed county.
 */

/**
 * County names as Google and our settings write them, made comparable: accents dropped (Doña Ana = Dona Ana),
 * lowercase, "St."/"Ste." spelled out (St. Lucie = Saint Lucie), and the county-type words removed
 * (County, Parish, Borough, Census Area, City and Borough, Municipality, Municipio).
 * "city" is NEVER removed: an independent city is its own county-equivalent, so "Richmond city"
 * (VA 51760) must never equal "Richmond County" (VA 51159). Same for Baltimore, St. Louis, Fairfax,
 * Roanoke, Franklin and Bedford. "James City County" and "Charles City County" keep their own "City".
 * "Island", "Islands", "District" and "Island Borough" are kept, so those names must match exactly.
 */
export function normCounty(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bste\.?(?=\s)/g, "sainte")
    .replace(/\bst\.?(?=\s)/g, "saint")
    .replace(/\b(city and borough|census area|municipality|municipio|county|parish|borough)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function parseAllowedCounties(raw?: string): { state: string; county: string }[] {
  const src = raw ?? process.env.NEXT_PUBLIC_ALLOWED_COUNTIES ?? ""
  return src
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const i = p.indexOf(":")
      return i > 0
        ? { state: p.slice(0, i).trim().toUpperCase(), county: normCounty(p.slice(i + 1)) }
        : { state: "", county: normCounty(p) }
    })
    .filter((c) => c.county)
}

/**
 * Independent cities: county-equivalents that Google usually returns WITHOUT a county
 * (administrative_area_level_2), only the city as the locality. Census 2020 class C7
 * (national_county2020.txt): 38 in Virginia, Baltimore city, St. Louis city, Carson City. Generated, do not edit.
 */
export const INDEPENDENT_CITIES: [state: string, name: string][] = [
  ["MD", "Baltimore city"], ["MO", "St. Louis city"], ["NV", "Carson City"], ["VA", "Alexandria city"],
  ["VA", "Bristol city"], ["VA", "Buena Vista city"], ["VA", "Charlottesville city"], ["VA", "Chesapeake city"],
  ["VA", "Colonial Heights city"], ["VA", "Covington city"], ["VA", "Danville city"], ["VA", "Emporia city"],
  ["VA", "Fairfax city"], ["VA", "Falls Church city"], ["VA", "Franklin city"], ["VA", "Fredericksburg city"],
  ["VA", "Galax city"], ["VA", "Hampton city"], ["VA", "Harrisonburg city"], ["VA", "Hopewell city"],
  ["VA", "Lexington city"], ["VA", "Lynchburg city"], ["VA", "Manassas city"], ["VA", "Manassas Park city"],
  ["VA", "Martinsville city"], ["VA", "Newport News city"], ["VA", "Norfolk city"], ["VA", "Norton city"],
  ["VA", "Petersburg city"], ["VA", "Poquoson city"], ["VA", "Portsmouth city"], ["VA", "Radford city"],
  ["VA", "Richmond city"], ["VA", "Roanoke city"], ["VA", "Salem city"], ["VA", "Staunton city"],
  ["VA", "Suffolk city"], ["VA", "Virginia Beach city"], ["VA", "Waynesboro city"], ["VA", "Williamsburg city"],
  ["VA", "Winchester city"]
]

/** The independent city a locality + state names, or "" (e.g. "Richmond", "VA" -> "Richmond city"). */
export function independentCity(state: string, locality: string): string {
  const st = (state || "").toUpperCase()
  const loc = normCounty(locality || "")
  if (!st || !loc) return ""
  const hit = INDEPENDENT_CITIES.find(
    ([s, name]) => s === st && (normCounty(name) === loc || normCounty(name.replace(/ city$/, "")) === loc)
  )
  return hit ? hit[1] : ""
}

/** Connecticut: the 2020 county list has the 8 historic counties; Google may return a planning region instead. */
const CT_COUNTIES_2020 = ["Fairfield", "Hartford", "Litchfield", "Middlesex", "New Haven", "New London", "Tolland", "Windham"].map(normCounty)

/**
 * The gate every form door should call.
 *  - No counties configured: the circle gate (unchanged).
 *  - Counties and circles: inside ANY circle passes; otherwise the county check below decides.
 *  - County check: "ST:*" passes the whole state; the address's county must match a listed one.
 *    No county from Google (or, in CT, a name that is not one of the 8 counties): an independent
 *    city found by locality + state is treated as that county-equivalent; otherwise the address
 *    passes when its state is one of the listed states (we never block a lead we can't place).
 */
export function isAddressInServiceArea(details: {
  lat?: number
  lng?: number
  state?: string
  county?: string
  city?: string
}): boolean {
  const counties = parseAllowedCounties()
  if (counties.length === 0) return isWithinServiceArea(details.lat, details.lng)
  const { lat, lng } = details
  if (lat !== undefined && lng !== undefined && parseServiceAreas().some((c) => haversineMiles(lat, lng, c.lat, c.lng) <= c.radiusMiles)) return true
  const st = (details.state || "").toUpperCase()
  if (counties.some((c) => c.county === "*" && c.state === st)) return true
  let county = details.county || ""
  if (st === "CT" && county && !CT_COUNTIES_2020.includes(normCounty(county))) county = ""
  if (!county) county = independentCity(st, details.city || "")
  if (!county) return !!st && counties.some((c) => c.state === st)
  const co = normCounty(county)
  return counties.some((c) => c.county === co && (!c.state || c.state === st))
}

export interface AddressBounds {
  south: number
  west: number
  north: number
  east: number
}

/**
 * The box Google address suggestions are kept inside. First match wins:
 *   1. NEXT_PUBLIC_ADDRESS_BOUNDS = "south,west,north,east"
 *      (use it with the county gate, where there are no circles)
 *   2. the bounding box of the NEXT_PUBLIC_SERVICE_AREAS circles, padded to each radius
 *   3. null = no restriction (nationwide clients keep suggesting everywhere)
 * The exact circle / county check still runs after selection (isAddressInServiceArea).
 */
export function addressBounds(rawBounds?: string, rawAreas?: string): AddressBounds | null {
  const src = (rawBounds ?? process.env.NEXT_PUBLIC_ADDRESS_BOUNDS ?? "").trim()
  if (src) {
    const [south, west, north, east] = src.split(",").map((v) => (v.trim() ? num(v.trim()) : undefined))
    if (
      south !== undefined && west !== undefined && north !== undefined && east !== undefined &&
      south < north && west < east
    ) {
      return { south, west, north, east }
    }
  }
  const circles = parseServiceAreas(rawAreas)
  if (circles.length === 0) return null
  let south = 90, north = -90, west = 180, east = -180
  for (const c of circles) {
    const latPad = c.radiusMiles / 69 // ~69 miles per degree of latitude
    const cosLat = Math.cos((c.lat * Math.PI) / 180)
    const lngPad = c.radiusMiles / (69 * (Math.abs(cosLat) > 1e-6 ? cosLat : 1e-6))
    south = Math.min(south, c.lat - latPad)
    north = Math.max(north, c.lat + latPad)
    west = Math.min(west, c.lng - lngPad)
    east = Math.max(east, c.lng + lngPad)
  }
  return { south, west, north, east }
}

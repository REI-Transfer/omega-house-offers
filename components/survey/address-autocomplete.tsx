"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

export interface AddressDetails {
  formattedAddress: string
  state?: string
  city?: string
  county?: string
  zip?: string
  lat?: number
  lng?: number
}

interface LatLngBoundsLiteral {
  south: number
  west: number
  north: number
  east: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onSelect: (address: string, details: AddressDetails) => void
  placeholder?: string
  bounds?: LatLngBoundsLiteral
  className?: string
}

declare global {
  interface Window {
    google: typeof google
    initGooglePlaces: () => void
  }
}

const BLOCKED_ADDRESSES = [
  "9809 newhall rd",
]

function isBlockedAddress(formattedAddress: string): boolean {
  const lower = formattedAddress.toLowerCase()
  return BLOCKED_ADDRESSES.some(blocked => lower.includes(blocked))
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing your address...",
  bounds,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if script already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true)
      initAutocomplete()
      return
    }

    // Load Google Places script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
      initAutocomplete()
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return

    const autocompleteOptions: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: "us" },
      types: ["address"],
      fields: ["formatted_address", "address_components", "geometry"],
    }
    if (bounds) {
      autocompleteOptions.bounds = new google.maps.LatLngBounds(
        { lat: bounds.south, lng: bounds.west },
        { lat: bounds.north, lng: bounds.east }
      )
      autocompleteOptions.strictBounds = false
    }
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, autocompleteOptions)

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      if (place?.formatted_address) {
        // Block specific addresses
        if (isBlockedAddress(place.formatted_address)) {
          alert("Sorry, we are unable to provide an offer for this property at this time.")
          onChange("")
          return
        }
        // Extract address components
        let state = ""
        let city = ""
        let county = ""
        let zip = ""
        
        place.address_components?.forEach((component) => {
          if (component.types.includes("administrative_area_level_1")) {
            state = component.short_name // e.g., "MD", "VA", "DC"
          }
          if (component.types.includes("locality")) {
            city = component.long_name
          }
          if (component.types.includes("administrative_area_level_2")) {
            county = component.long_name
          }
          if (component.types.includes("postal_code")) {
            zip = component.short_name
          }
        })
        
        const loc = place.geometry?.location
        const details: AddressDetails = {
          formattedAddress: place.formatted_address,
          state,
          city,
          county,
          zip,
          lat: loc ? loc.lat() : undefined,
          lng: loc ? loc.lng() : undefined,
        }
        
        onChange(place.formatted_address)
        onSelect(place.formatted_address, details)
      }
    })
  }

  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`relative ${className || ""}`}>
      {!value && !isFocused && (
        <div className="absolute -inset-1 rounded-2xl bg-[#0891b2]/20 animate-pulse" />
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <MapPin className="h-5 w-5 text-[#0891b2]" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-16 pl-10 rounded-xl border-2 border-[#0891b2]/50 bg-white text-lg text-gray-900 placeholder:text-gray-400 focus:border-[#0891b2] focus:ring-[#0891b2]/20"
        />
        {!isLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#0891b2]" />
          </div>
        )}
      </div>
    </div>
  )
}

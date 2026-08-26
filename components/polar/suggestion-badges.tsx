"use client"

interface Suggestion {
  id: string
  label: string
}

interface SuggestionBadgesProps {
  suggestions: Suggestion[]
  onSelect?: (suggestion: Suggestion) => void
}

export function SuggestionBadges({ suggestions, onSelect }: SuggestionBadgesProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect?.(suggestion)}
          className="bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white rounded-full"
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  )
}

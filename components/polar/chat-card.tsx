"use client"

import { useState } from "react"
import { SnowflakeIcon } from "@/components/icons/snowflake-icon"
import { ChatInput } from "./chat-input"
import { InputControls } from "./input-controls"
import { SuggestionBadges } from "./suggestion-badges"

interface ChatCardProps {
  userName?: string
  onBackgroundChange?: (imageUrl: string) => void
  onResetBackground?: () => void
}

export function ChatCard({ userName = "Juan", onBackgroundChange, onResetBackground }: ChatCardProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSuggestionSelect = (suggestion: { id: string; label: string }) => {
    setInputValue(suggestion.label)
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
      <div className="flex flex-col gap-6 items-start">
        {/* Header with logo and greeting */}
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-2">
            <SnowflakeIcon className="h-5 w-5 text-sky-400" />
            <p className="text-sm text-white/80">Hello {userName}!</p>
          </div>
          <h1 className="text-center text-2xl font-semibold text-white">What can I help you today?</h1>
        </div>

        {/* Input section */}
        <div className="flex w-full flex-col gap-1">
          <ChatInput placeholder="Ask me anything..." value={inputValue} onChange={setInputValue} />
          <InputControls onBackgroundChange={onBackgroundChange} onResetBackground={onResetBackground} />
        </div>

        {/* Suggestions */}
        <SuggestionBadges suggestions={DEFAULT_SUGGESTIONS} onSelect={handleSuggestionSelect} />
      </div>
    </div>
  )
}

const DEFAULT_SUGGESTIONS = [
  { id: "1", label: "Write an email" },
  { id: "2", label: "Summarize a document" },
  { id: "3", label: "Generate code" },
  { id: "4", label: "Brainstorm ideas" },
]

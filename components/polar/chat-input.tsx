"use client"

import type React from "react"

interface ChatInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
}

export function ChatInput({
  placeholder = "Ask me anything...",
  value: externalValue,
  onChange: externalOnChange,
  onSubmit,
}: ChatInputProps) {
  const value = externalValue ?? ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && onSubmit) {
      onSubmit(value)
      externalOnChange?.("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => externalOnChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-white/30 rounded-full"
      />
    </form>
  )
}

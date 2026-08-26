"use client"

import { useState } from "react"
import { ImageIcon, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUploadModal } from "./image-upload-modal"
import { ResetBackgroundModal } from "./reset-background-modal"

interface InputControlsProps {
  modelName?: string
  onBackgroundChange?: (imageUrl: string) => void
  onResetBackground?: () => void
}

export function InputControls({ modelName = "Polar 4.5", onBackgroundChange, onResetBackground }: InputControlsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  const handleConfirmImage = (imageUrl: string) => {
    onBackgroundChange?.(imageUrl)
  }

  const handleResetConfirm = () => {
    onResetBackground?.()
  }

  return (
    <>
      <div className="flex w-full items-center justify-between px-4">
        <span className="text-xs text-white/60">{modelName}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(true)}
            className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="sr-only">Attach image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsResetModalOpen(true)}
            className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>

      <ImageUploadModal open={isModalOpen} onOpenChange={setIsModalOpen} onConfirm={handleConfirmImage} />
      <ResetBackgroundModal open={isResetModalOpen} onOpenChange={setIsResetModalOpen} onConfirm={handleResetConfirm} />
    </>
  )
}

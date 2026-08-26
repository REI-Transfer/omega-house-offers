"use client"

import type React from "react"

import { useCallback, useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ImageUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (imageUrl: string) => void
}

export function ImageUploadModal({ open, onOpenChange, onConfirm }: ImageUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      handleFile(file)
    },
    [handleFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleConfirm = useCallback(() => {
    if (preview) {
      onConfirm(preview)
      setPreview(null)
      onOpenChange(false)
    }
  }, [preview, onConfirm, onOpenChange])

  const handleCancel = useCallback(() => {
    setPreview(null)
    onOpenChange(false)
  }, [onOpenChange])

  const clearPreview = useCallback(() => {
    setPreview(null)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/20 bg-black/80 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Change Background Image</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors ${
              isDragging
                ? "border-sky-400 bg-sky-400/10"
                : "border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-white/60" />
            <div className="text-center">
              <p className="text-sm text-white/80">Drag and drop an image here</p>
              <p className="text-xs text-white/50">or click to browse files</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
        ) : (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearPreview}
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-48 w-full rounded-xl object-cover" />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleCancel} className="text-white/70 hover:bg-white/10 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!preview}
            className="bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

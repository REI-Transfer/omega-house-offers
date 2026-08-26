"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ResetBackgroundModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ResetBackgroundModal({ open, onOpenChange, onConfirm }: ResetBackgroundModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-white/20 bg-black/80 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Reset Background Image</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            Are you sure you want to reset the background to the original image? This will remove your custom
            background.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-sky-500 text-white hover:bg-sky-600">
            Reset Background
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

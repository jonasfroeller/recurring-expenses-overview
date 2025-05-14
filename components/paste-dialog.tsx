"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface PasteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (jsonData: string) => void
}

export function PasteDialog({ open, onOpenChange, onImport }: PasteDialogProps) {
  const [pastedText, setPastedText] = useState("")

  const handleImport = () => {
    onImport(pastedText)
    setPastedText("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>JSON aus Zwischenablage importieren</DialogTitle>
          <DialogDescription>
            Fügen Sie den JSON-Text in das Textfeld ein und klicken Sie auf "Importieren".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="JSON hier einfügen..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleImport}>Importieren</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

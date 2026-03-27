import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { createFolder } from "@/server/rss"

interface AddFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFolderCreated: (folder: any) => void
}

export function AddFolderModal({
  open,
  onOpenChange,
  onFolderCreated,
}: AddFolderModalProps) {
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleClose = (v: boolean) => {
    if (!v) {
      setName("")
      setError("")
    }
    onOpenChange(v)
  }

  const handleSave = async () => {
    if (!name.trim()) { setError("Folder name is required"); return }
    setSaving(true)
    setError("")
    try {
      const folder = await createFolder({ data: { name } })
      onFolderCreated(folder)
      handleClose(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create folder")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton className="max-w-sm border-white/10 bg-[#181818] text-white">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-white">
            New Folder
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-0.5 py-4">
          <div className="flex flex-col gap-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
              }}
              placeholder="Folder Name…"
              className="h-9 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <DialogFooter className="border-t border-white/5 bg-transparent pt-3">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            className="h-8 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-8 bg-white px-5 text-xs font-semibold text-black hover:bg-zinc-200"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createFeed } from "@/server/rss"

interface Folder {
  id: string
  name: string
}

interface AddFeedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: Folder[]
  onFeedAdded: () => void
}

export function AddFeedModal({
  open,
  onOpenChange,
  folders,
  onFeedAdded,
}: AddFeedModalProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [folderId, setFolderId] = useState<string | null>(null)
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")
  const [includeKeywords, setIncludeKeywords] = useState<string[]>([])
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setName("")
    setUrl("")
    setFolderId(null)
    setIncludeInput("")
    setExcludeInput("")
    setIncludeKeywords([])
    setExcludeKeywords([])
    setError("")
  }

  const handleClose = (v: boolean) => {
    if (!v) reset()
    onOpenChange(v)
  }

  const addKeyword = (
    input: string,
    setInput: (v: string) => void,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    const kw = input.trim()
    if (kw && !list.includes(kw)) setList([...list, kw])
    setInput("")
  }

  const handleSave = async () => {
    if (!name.trim()) { setError("Feed name is required"); return }
    if (!url.trim()) { setError("Feed URL is required"); return }
    setSaving(true)
    setError("")
    try {
      await createFeed({
        data: { name, url, folderId, includeKeywords, excludeKeywords },
      })
      onFeedAdded()
      handleClose(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save feed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        className="max-w-md border-white/10 bg-[#181818] text-white sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-white">
            Add Feed
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-0.5">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400">Feed Name</label>
            <Input
              id="add-feed-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OpenAI Blog"
              className="h-8 border-white/10 bg-white/5 text-xs text-white placeholder:text-zinc-600"
            />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400">Feed URL</label>
            <Input
              id="add-feed-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://openai.com/news/rss.xml"
              className="h-8 border-white/10 bg-white/5 text-xs text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Folder */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400">Folder (optional)</label>
            <Select
              value={folderId ?? "__none__"}
              onValueChange={(v) => setFolderId(v === "__none__" ? null : v ?? null)}
            >
              <SelectTrigger
                id="add-feed-folder"
                className="h-8 border-white/10 bg-white/5 text-xs text-zinc-300"
              >
                <SelectValue placeholder="No folder" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#1a1a1a] text-zinc-200">
                <SelectItem value="__none__">No folder</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include Keywords */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400">Include Keywords</label>
            <Input
              id="add-feed-include"
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addKeyword(includeInput, setIncludeInput, includeKeywords, setIncludeKeywords)
                }
              }}
              placeholder="Type and press Enter"
              className="h-8 border-white/10 bg-white/5 text-xs text-white placeholder:text-zinc-600"
            />
            {includeKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {includeKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    className="flex items-center gap-1 bg-blue-500/20 text-[10px] text-blue-300"
                  >
                    {kw}
                    <button
                      onClick={() =>
                        setIncludeKeywords(includeKeywords.filter((k) => k !== kw))
                      }
                      className="ml-0.5 hover:text-white"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Exclude Keywords */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400">Exclude Keywords</label>
            <Input
              id="add-feed-exclude"
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addKeyword(excludeInput, setExcludeInput, excludeKeywords, setExcludeKeywords)
                }
              }}
              placeholder="Type and press Enter"
              className="h-8 border-white/10 bg-white/5 text-xs text-white placeholder:text-zinc-600"
            />
            {excludeKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {excludeKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    className="flex items-center gap-1 bg-red-500/20 text-[10px] text-red-300"
                  >
                    {kw}
                    <button
                      onClick={() =>
                        setExcludeKeywords(excludeKeywords.filter((k) => k !== kw))
                      }
                      className="ml-0.5 hover:text-white"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <DialogFooter className="border-t border-white/5 bg-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleClose(false)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            id="add-feed-save-btn"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-7 bg-white text-xs font-semibold text-black hover:bg-zinc-200"
          >
            {saving ? "Saving…" : "Save Feed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

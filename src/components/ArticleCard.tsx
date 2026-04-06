import { useState } from "react"
import { Heart, ExternalLink, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { ArticleSheet } from "@/components/ArticleSheet"
import { toggleFavorite } from "@/server/rss"
import { useReaderStore } from "@/store/readerStore"
import type { ArticleRow } from "@/components/ArticleGrid"

const PASTEL_COLORS = [
  "#dbeafe",
  "#fce7f3",
  "#dcfce7",
  "#fef9c3",
  "#ede9fe",
  "#ffedd5",
]

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

function formatDate(date: Date | string | null) {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(date: Date | string | null) {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

interface ArticleCardProps {
  article: ArticleRow
  index: number
  onUpdate?: () => void
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const favorites = useReaderStore((s) => s.favorites)
  const toggleZustandFavorite = useReaderStore((s) => s.toggleFavorite)
  const isFavorite = favorites.includes(article.id) || article.isFavorite
  const [sheetOpen, setSheetOpen] = useState(false)
  const domain = article.domain ?? getDomain(article.link)
  const fallbackColor = PASTEL_COLORS[index % PASTEL_COLORS.length]

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // Toggle in Zustand store (localStorage-persisted)
    toggleZustandFavorite(article.id)
    // Also sync to DB for legacy compatibility
    try {
      await toggleFavorite({ data: { id: article.id, state: !isFavorite } })
    } catch {
      // Revert Zustand if DB fails
      toggleZustandFavorite(article.id)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(article.link)
      toast.success("Link copied")
    } catch {
      toast.error("Failed to copy link")
    }
  }

  return (
    <>
      <Card
        id={`article-card-${article.id}`}
        onClick={() => setSheetOpen(true)}
        className="group relative flex flex-col gap-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-white/5 hover:border-white/10 p-0 rounded-xl cursor-pointer bg-[#161616]"
      >
        {/* Top: Image area — strict 4:3 ratio so it behaves consistently */}
        <div
          className="relative w-full overflow-hidden shrink-0"
          style={{ backgroundColor: fallbackColor, aspectRatio: "4/3" }}
        >
          {article.image && (
            <img
              src={article.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                ; (e.target as HTMLImageElement).style.display = "none"
              }}
            />
          )}

          {/* Heart icon */}
          <button
            onClick={handleFavorite}
            className="absolute top-2.5 right-2.5 z-10 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle favorite"
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md border transition-colors ${isFavorite ? "bg-red-500/10 border-red-500/20" : "bg-black/20 border-white/10"}`}>
              <Heart
                className="h-3.5 w-3.5 transition-all"
                style={{
                  fill: isFavorite ? "#ef4444" : "transparent",
                  color: isFavorite ? "#ef4444" : "white",
                }}
              />
            </div>
          </button>

          {/* Source domain badge */}
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md border border-white/10 shadow-xl">
            {domain}
          </span>
        </div>

        {/* Bottom: Info area — auto height prevents text clipping! */}
        <CardContent className="flex flex-col justify-between bg-[#1a1a1a] p-3 grow">
          <div className="flex flex-col gap-1 mb-2">
            {/* Published date */}
            <p className="text-[10px] text-zinc-500 leading-none">
              {formatDate(article.publishedAt)}
            </p>

            {/* Title — max 2 lines */}
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-white">
              {article.title}
            </h3>
          </div>

          {/* Bottom row */}
          <div className="mt-auto flex items-center justify-between">
            {/* Time */}
            <span className="text-[10px] text-zinc-600">
              {formatTime(article.publishedAt)}
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5">

              {/* Share (Icon only) */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center rounded px-2 py-0.5 text-zinc-400 border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white transition-colors ml-1 h-7 w-7"
                title="Share article"
              >
                <Share2 className="h-3 w-3" />
              </button>

              {/* External link */}
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-1 flex items-center justify-center rounded p-0.5 text-zinc-500 border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white transition-colors h-7 w-7"
                aria-label="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheet preview — reuses existing ArticleSheet */}
      <ArticleSheet
        article={sheetOpen ? article : null}
        onClose={() => setSheetOpen(false)}
      />
    </>
  )
}

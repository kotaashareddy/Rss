import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Bookmark,
  Clock,
  Heart,
  PanelLeftOpen,
} from "lucide-react"
import { ArticleSheet } from "@/components/ArticleSheet"
import type { Selection } from "@/components/Sidebar"
import {
  refreshAllFeeds,
  toggleBookmark,
  toggleReadLater,
  toggleFavorite,
} from "@/server/rss"

type FilterType = "All" | "Unread" | "Unused" | "Trending"

const PASTEL_COLORS = [
  "bg-[#c8dff7]",
  "bg-[#f9cfe8]",
  "bg-[#c4f0dc]",
  "bg-[#daccf5]",
  "bg-[#f5e9c4]",
  "bg-[#f7d9c4]",
]

export interface ArticleRow {
  id: string
  feedId: string | null
  title: string
  description: string | null
  link: string
  image: string | null
  publishedAt: Date | string | null
  isUsed: boolean | null
  visitCount: number | null
  isBookmarked: boolean | null
  isReadLater: boolean | null
  isFavorite: boolean | null
  createdAt?: Date | string | null
  // enriched
  feedName?: string
  domain?: string
}

interface ArticleGridProps {
  articles: ArticleRow[]
  selection: Selection
  onAddFeedClick: () => void
  onRefreshed: () => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

const filters: FilterType[] = ["All", "Unread", "Unused", "Trending"]

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}



function getSelectionTitle(selection: Selection): string {
  switch (selection.type) {
    case "all": return "All Articles"
    case "today": return "Today"
    case "bookmarks": return "Bookmarks"
    case "readLater": return "Read Later"
    case "favorites": return "Favorites"
    case "folder": return "Folder"
    case "feed": return "Feed"
  }
}

export function ArticleGrid({
  articles,
  selection,
  onAddFeedClick,
  onRefreshed,
  sidebarOpen,
  setSidebarOpen,
}: ArticleGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("latest")
  const [refreshing, setRefreshing] = useState(false)
  const [activeArticle, setActiveArticle] = useState<ArticleRow | null>(null)

  // Filter and sort
  const filtered = articles
    .filter((a) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Unused" && !a.isUsed) ||
        (activeFilter === "Trending" && (a.visitCount ?? 0) > 3) ||
        (activeFilter === "Unread" && !a.isUsed)
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.domain ?? getDomain(a.link)).includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime()
      }
      return new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
    })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshAllFeeds()
      onRefreshed()
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
  }

  const openSheet = (article: ArticleRow) => {
    setActiveArticle(article)
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="mr-2 h-7 w-7 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        )}
        {/* Filter pills */}
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeFilter === f
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <Input
            id="article-search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-44 rounded-lg border-white/10 bg-white/5 pl-8 text-xs text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
          />
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => v && setSort(v)}>
          <SelectTrigger
            id="sort-select"
            className="h-8 w-28 border-white/10 bg-white/5 text-xs text-zinc-300"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#1a1a1a] text-zinc-200">
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh */}
        <Button
          id="refresh-btn"
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 w-8 text-zinc-400 hover:bg-white/10 hover:text-white"
          title="Refresh all feeds"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </Button>

        {/* Add Feed */}
        <Button
          id="add-feed-btn"
          size="sm"
          onClick={onAddFeedClick}
          className="h-8 gap-1.5 bg-white text-xs font-semibold text-black hover:bg-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Feed
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-zinc-600">
              No articles in {getSelectionTitle(selection)}.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddFeedClick}
              className="text-xs text-zinc-500 hover:text-white"
            >
              + Add a feed to get started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((article, idx) => (
              <ArticleCard
                key={article.id}
                article={article}
                colorClass={PASTEL_COLORS[idx % PASTEL_COLORS.length]}
                onOpen={() => openSheet(article)}
                onUpdate={onRefreshed}
              />
            ))}
          </div>
        )}
      </div>

      {/* Article Sheet */}
      <ArticleSheet
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </div>
  )
}

// ─── Card ─────────────────────────────────────────

function ArticleCard({
  article,
  colorClass,
  onOpen,
  onUpdate,
}: {
  article: ArticleRow
  colorClass: string
  onOpen: () => void
  onUpdate: () => void
}) {
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked ?? false)
  const [isReadLater, setIsReadLater] = useState(article.isReadLater ?? false)
  const [isFavorite, setIsFavorite] = useState(article.isFavorite ?? false)
  const domain = article.domain ?? getDomain(article.link)
  const tag =
    (article.visitCount ?? 0) > 3
      ? "Trending"
      : !article.isUsed
        ? null
        : null

  return (
    <div
      id={`article-card-${article.id}`}
      className="group relative overflow-hidden rounded-xl border border-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-2xl"
    >
      {/* Top: image or pastel */}
      <div className={`relative h-32 overflow-hidden ${article.image ? "" : colorClass}`}>
        {article.image ? (
          <img
            src={article.image}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              // hide broken image, show pastel bg
              ;(e.target as HTMLElement).style.display = "none"
              ;(
                e.target as HTMLElement
              ).parentElement!.className = `relative h-32 overflow-hidden ${colorClass}`
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        )}

        {/* Domain + badge overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3">
          <span
            className={`text-[11px] font-semibold drop-shadow ${
              article.image ? "text-white" : "text-black/60"
            }`}
          >
            {domain}
          </span>
          {tag && (
            <Badge
              className={`h-4 px-1.5 text-[9px] font-semibold ${
                tag === "Trending"
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-800/80 text-zinc-100"
              }`}
            >
              {tag}
            </Badge>
          )}
        </div>

        {/* Hover action overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            className="h-7 bg-white px-3 text-[11px] font-semibold text-black hover:bg-zinc-200"
          >
            Open
          </Button>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 border border-white/30 text-white hover:bg-white/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Bottom: dark info */}
      <div className="bg-[#1a1a1a] p-3">
        {article.feedName && (
          <p className="mb-1 text-[11px] font-medium text-zinc-500">{article.feedName}</p>
        )}
        <h3 className="mb-1.5 line-clamp-1 text-sm font-semibold text-white">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
          {article.description ?? "No description available."}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-white"
              onClick={async (e) => {
                e.stopPropagation();
                const nextState = !isBookmarked;
                setIsBookmarked(nextState);
                await toggleBookmark({ data: { id: article.id, state: nextState } });
                onUpdate();
              }}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-white text-white" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-white"
              onClick={async (e) => {
                e.stopPropagation();
                const nextState = !isReadLater;
                setIsReadLater(nextState);
                await toggleReadLater({ data: { id: article.id, state: nextState } });
                onUpdate();
              }}
            >
              <Clock className={`h-4 w-4 ${isReadLater ? "fill-white text-white" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-white"
              onClick={async (e) => {
                e.stopPropagation();
                const nextState = !isFavorite;
                setIsFavorite(nextState);
                await toggleFavorite({ data: { id: article.id, state: nextState } });
                onUpdate();
              }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

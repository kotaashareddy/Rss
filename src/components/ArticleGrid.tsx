import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  PanelLeftOpen,
} from "lucide-react"
import { ArticleCard } from "@/components/ArticleCard"
import { refreshAllFeeds, refreshFolder } from "@/server/rss"

type FilterType = "All"

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
  title: string
  /** Optional folderId used when refreshing a folder's feeds */
  folderId?: string
  onAddFeedClick: () => void
  onRefreshed: () => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

const filters: FilterType[] = ["All"]

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

export function ArticleGrid({
  articles,
  title,
  folderId,
  onAddFeedClick,
  onRefreshed,
  sidebarOpen,
  setSidebarOpen,
}: ArticleGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("latest")
  const [refreshing, setRefreshing] = useState(false)

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
      if (folderId) {
        await refreshFolder({ data: { folderId } })
      } else {
        await refreshAllFeeds()
      }
      onRefreshed()
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
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
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeFilter === f
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
              No articles in {title}.
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((article, idx) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={idx}
                onUpdate={onRefreshed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

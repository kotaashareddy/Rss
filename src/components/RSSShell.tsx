import { useState, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Filter,
  RefreshCw,
  Plus,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { ArticleGrid } from "@/components/ArticleGrid"
import { AddFeedModal } from "@/components/AddFeedModal"
import { getAllData, refreshAllFeeds, refreshFolder } from "@/server/rss"
import type { FolderRow, FeedRow } from "@/components/Sidebar"
import type { ArticleRow } from "@/components/ArticleGrid"
import { useReaderStore } from "@/store/readerStore"

// no "all" now — 15 days is the minimum
type DateFilterOption = 15 | 30 | 60 | 90

const DATE_FILTER_OPTIONS: { label: string; value: DateFilterOption }[] = [
  { label: "Last 15 Days", value: 15 },
  { label: "Last 30 Days", value: 30 },
  { label: "Last 60 Days", value: 60 },
  { label: "Last 90 Days", value: 90 },
]

interface RSSShellProps {
  initialData: {
    folders: FolderRow[]
    feeds: FeedRow[]
    articles: ArticleRow[]
  }
  /** Label for the current view (feed name, folder name, or "All Articles") */
  title: string
  /** When viewing a feed, pass the parent folder name to show "Folder › Feed" */
  folderName?: string
  /** Called with enriched articles; return the filtered subset for this view */
  filterArticles: (articles: ArticleRow[], feeds: FeedRow[]) => ArticleRow[]
  /** Optional folderId for targeted refresh */
  folderId?: string
  /**
   * When true the date-range filter is hidden and bypassed.
   * Use on routes like Today and Favorites that have their own fixed filter.
   */
  skipDateFilter?: boolean
}

function enrichArticles(rawArticles: ArticleRow[], feeds: FeedRow[]): ArticleRow[] {
  const feedNameMap = Object.fromEntries(feeds.map((f) => [f.id, f.name]))
  return rawArticles.map((a) => ({
    ...a,
    feedName: a.feedId ? feedNameMap[a.feedId] : undefined,
    domain: (() => {
      try { return new URL(a.link).hostname.replace("www.", "") } catch { return a.link }
    })(),
  }))
}

function applyDateFilter(articles: ArticleRow[], filter: DateFilterOption): ArticleRow[] {
  const cutoff = new Date(Date.now() - filter * 24 * 60 * 60 * 1000)
  return articles.filter((a) => {
    if (!a.publishedAt) return false
    return new Date(a.publishedAt) >= cutoff
  })
}

export function RSSShell({
  initialData,
  title,
  folderName,
  filterArticles,
  folderId,
  skipDateFilter = false,
}: RSSShellProps) {
  const [folders, setFolders] = useState<FolderRow[]>(initialData.folders)
  const [feeds, setFeeds] = useState<FeedRow[]>(initialData.feeds)
  const [rawArticles, setRawArticles] = useState<ArticleRow[]>(initialData.articles)
  const [addFeedOpen, setAddFeedOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilterOption>(15)
  const [refreshing, setRefreshing] = useState(false)
  const favorites = useReaderStore((s) => s.favorites)

  const reload = useCallback(async () => {
    const data = await getAllData()
    setFolders(data.folders)
    setFeeds(data.feeds)
    setRawArticles(data.articles as ArticleRow[])
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (folderId) {
        await refreshFolder({ data: { folderId } })
      } else {
        await refreshAllFeeds()
      }
      reload()
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
  }

  // Enrich all articles with domain + feedName
  const allArticles = enrichArticles(rawArticles, feeds)

  // Apply the route-specific filter (e.g. folder / feed / bookmarks)
  const routeFiltered = filterArticles(allArticles, feeds)

  // Apply date filter — skipped for routes like Today / Favorites that own their filter
  const dateFiltered = skipDateFilter ? routeFiltered : applyDateFilter(routeFiltered, dateFilter)

  // Apply search filter
  const displayedArticles = search
    ? dateFiltered.filter((a) => {
      const q = search.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        (a.domain ?? "").includes(q) ||
        (a.feedName ?? "").toLowerCase().includes(q)
      )
    })
    : dateFiltered

  // Counts per feed (for sidebar badges)
  const articleCounts: Record<string, number> = {}
  for (const a of allArticles) {
    if (a.feedId) {
      articleCounts[a.feedId] = (articleCounts[a.feedId] ?? 0) + 1
    }
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const totalCount = allArticles.length
  const todayCount = allArticles.filter(
    (a) => a.publishedAt && new Date(a.publishedAt) >= todayStart
  ).length
  const favoritesCount = allArticles.filter(
    (a) => favorites.includes(a.id) || a.isFavorite
  ).length

  const selectedOption = DATE_FILTER_OPTIONS.find((o) => o.value === dateFilter)!

  return (
    <SidebarProvider>
      <AppSidebar
        folders={folders}
        feeds={feeds}
        articleCounts={articleCounts}
        totalCount={totalCount}
        todayCount={todayCount}
        favoritesCount={favoritesCount}
        onFolderCreated={reload}
      />
      <SidebarInset>
        {/* ── Top bar ── */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800 px-3">

          {/* Left: sidebar toggle + separator + breadcrumb */}
          <div className="flex shrink-0 items-center gap-2">
            <SidebarTrigger className="shrink-0" />
            <Separator orientation="vertical" className="h-4 bg-zinc-700" />
            <div className="flex items-center gap-1">
              {folderName ? (
                <>
                  <span className="text-sm font-semibold text-zinc-300">{folderName}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                  <span className="text-sm font-bold text-white">{title}</span>
                </>
              ) : (
                <span className="text-sm font-bold text-white">{title}</span>
              )}
            </div>
          </div>

          {/* Center: search — flex-1 so it fills available space */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <Input
              id="article-search"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border-white/10 bg-white/5 pl-8 text-xs text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
            />
          </div>

          {/* Date filter dropdown — hidden on routes that own their filter (Today, Favorites) */}
          {!skipDateFilter && (
            <DropdownMenu>
              <DropdownMenuTrigger
                id="date-filter-btn"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Filter className="h-3.5 w-3.5 text-zinc-400" />
                {selectedOption.label}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="min-w-[160px] rounded-xl border border-zinc-700/60 bg-[#141414] p-1 text-zinc-200 shadow-xl"
              >
                {DATE_FILTER_OPTIONS.map((opt) => {
                  const active = dateFilter === opt.value
                  return (
                    <DropdownMenuItem
                      key={String(opt.value)}
                      id={`filter-${opt.value}`}
                      onClick={() => setDateFilter(opt.value)}
                      className={[
                        "flex cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors",
                        active
                          ? "text-blue-400 focus:bg-blue-500/10 focus:text-blue-400"
                          : "text-zinc-300 hover:text-white focus:bg-zinc-800",
                      ].join(" ")}
                    >
                      {opt.label}
                      {active && <Check className="h-3.5 w-3.5 text-blue-400" />}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Sync */}
          <Button
            id="refresh-btn"
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-white"
            title="Refresh all feeds"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>

          {/* Add Feed */}
          <Button
            id="add-feed-btn"
            size="sm"
            onClick={() => setAddFeedOpen(true)}
            className="h-8 shrink-0 gap-1.5 bg-white text-xs font-semibold text-black hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Feed
          </Button>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden">
          <ArticleGrid
            articles={displayedArticles}
            title={title}
            folderId={folderId}
            onRefreshed={reload}
          />
        </div>
      </SidebarInset>

      <AddFeedModal
        open={addFeedOpen}
        onOpenChange={setAddFeedOpen}
        folders={folders}
        onFeedAdded={reload}
      />
    </SidebarProvider>
  )
}

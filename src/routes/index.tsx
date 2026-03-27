import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { Sidebar } from "@/components/Sidebar"
import { ArticleGrid } from "@/components/ArticleGrid"
import { AddFeedModal } from "@/components/AddFeedModal"
import { AddFolderModal } from "@/components/AddFolderModal"
import { getAllData } from "@/server/rss"
import type { Selection, FolderRow, FeedRow } from "@/components/Sidebar"
import type { ArticleRow } from "@/components/ArticleGrid"

export const Route = createFileRoute("/")({
  loader: async () => {
    return await getAllData()
  },
  component: RSSReader,
})

function RSSReader() {
  const loaderData = Route.useLoaderData()

  const [folders, setFolders] = useState<FolderRow[]>(loaderData.folders)
  const [feeds, setFeeds] = useState<FeedRow[]>(loaderData.feeds)
  const [rawArticles, setRawArticles] = useState(loaderData.articles)

  const [selection, setSelection] = useState<Selection>({ type: "all" })
  const [addFeedOpen, setAddFeedOpen] = useState(false)
  const [addFolderOpen, setAddFolderOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Reload all data from DB
  const reload = useCallback(async () => {
    const data = await getAllData()
    setFolders(data.folders)
    setFeeds(data.feeds)
    setRawArticles(data.articles)
  }, [])

  // Build feedId -> feedName map
  const feedNameMap = Object.fromEntries(feeds.map((f) => [f.id, f.name]))

  // Enrich articles with domain + feedName
  const allArticles: ArticleRow[] = rawArticles.map((a) => ({
    ...a,
    feedName: a.feedId ? feedNameMap[a.feedId] : undefined,
    domain: (() => {
      try {
        return new URL(a.link).hostname.replace("www.", "")
      } catch {
        return a.link
      }
    })(),
  }))

  // Compute today timestamp
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Filter articles based on sidebar selection
  const filteredArticles = (() => {
    switch (selection.type) {
      case "all":
        return allArticles
      case "today":
        return allArticles.filter(
          (a) => a.publishedAt && new Date(a.publishedAt) >= todayStart
        )
      case "bookmarks":
        return allArticles.filter((a) => a.isBookmarked)
      case "readLater":
        return allArticles.filter((a) => a.isReadLater)
      case "favorites":
        return allArticles.filter((a) => a.isFavorite)
      case "folder": {
        const folderFeeds = feeds.filter((f) => f.folderId === selection.folderId)
        const ids = new Set(folderFeeds.map((f) => f.id))
        return allArticles.filter((a) => a.feedId && ids.has(a.feedId))
      }
      case "feed":
        return allArticles.filter((a) => a.feedId === selection.feedId)
      default:
        return allArticles
    }
  })()

  // Counts per feed (for sidebar badges)
  const articleCounts: Record<string, number> = {}
  for (const a of allArticles) {
    if (a.feedId) {
      articleCounts[a.feedId] = (articleCounts[a.feedId] ?? 0) + 1
    }
  }

  const totalCount = allArticles.length
  const todayCount = allArticles.filter(
    (a) => a.publishedAt && new Date(a.publishedAt) >= todayStart
  ).length
  const bookmarksCount = allArticles.filter((a) => a.isBookmarked).length
  const readLaterCount = allArticles.filter((a) => a.isReadLater).length
  const favoritesCount = allArticles.filter((a) => a.isFavorite).length

  const handleFolderCreated = async () => {
    await reload()
  }

  const handleFeedAdded = async () => {
    await reload()
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-40 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        <Sidebar
          folders={folders}
          feeds={feeds}
          articleCounts={articleCounts}
          totalCount={totalCount}
          todayCount={todayCount}
          bookmarksCount={bookmarksCount}
          readLaterCount={readLaterCount}
          favoritesCount={favoritesCount}
          selection={selection}
          onSelect={setSelection}
          onAddFolderClick={() => setAddFolderOpen(true)}
          onAddFeedClick={() => setAddFeedOpen(true)}
          onRefreshData={reload}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <ArticleGrid
          articles={filteredArticles}
          selection={selection}
          onAddFeedClick={() => setAddFeedOpen(true)}
          onRefreshed={reload}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      <AddFeedModal
        open={addFeedOpen}
        onOpenChange={setAddFeedOpen}
        folders={folders}
        onFeedAdded={handleFeedAdded}
      />

      <AddFolderModal
        open={addFolderOpen}
        onOpenChange={setAddFolderOpen}
        onFolderCreated={handleFolderCreated}
      />
    </div>
  )
}

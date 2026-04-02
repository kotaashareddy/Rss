import { useState, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ArticleGrid } from "@/components/ArticleGrid"
import { AddFeedModal } from "@/components/AddFeedModal"
import { getAllData } from "@/server/rss"
import type { FolderRow, FeedRow } from "@/components/Sidebar"
import type { ArticleRow } from "@/components/ArticleGrid"
import { useReaderStore } from "@/store/readerStore"

interface RSSShellProps {
  initialData: {
    folders: FolderRow[]
    feeds: FeedRow[]
    articles: ArticleRow[]
  }
  /** Title shown in breadcrumb */
  title: string
  /** Called with enriched articles; return the filtered subset for this view */
  filterArticles: (articles: ArticleRow[], feeds: FeedRow[]) => ArticleRow[]
  /** Optional folderId for targeted refresh */
  folderId?: string
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

export function RSSShell({
  initialData,
  title,
  filterArticles,
  folderId,
}: RSSShellProps) {
  const [folders, setFolders] = useState<FolderRow[]>(initialData.folders)
  const [feeds, setFeeds] = useState<FeedRow[]>(initialData.feeds)
  const [rawArticles, setRawArticles] = useState<ArticleRow[]>(initialData.articles)
  const [addFeedOpen, setAddFeedOpen] = useState(false)
  const favorites = useReaderStore((s) => s.favorites)

  const reload = useCallback(async () => {
    const data = await getAllData()
    setFolders(data.folders)
    setFeeds(data.feeds)
    setRawArticles(data.articles as ArticleRow[])
  }, [])

  // Enrich all articles with domain + feedName
  const allArticles = enrichArticles(rawArticles, feeds)

  // Apply the route-specific filter
  const filteredArticles = filterArticles(allArticles, feeds)

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
  // Favorites count from zustand (articles in store that also exist in our DB)
  const favoritesCount = favorites.filter((id) => allArticles.some((a) => a.id === id)).length

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
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden">
          <ArticleGrid
            articles={filteredArticles}
            title={title}
            folderId={folderId}
            onAddFeedClick={() => setAddFeedOpen(true)}
            onRefreshed={reload}
            sidebarOpen={true}
            setSidebarOpen={() => { }}
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

import { createFileRoute } from "@tanstack/react-router"
import { getAllData } from "@/server/rss"
import { RSSShell } from "@/components/RSSShell"
import { slugify } from "@/lib/slugify"

export const Route = createFileRoute("/$folderSlug/$feedSlug/")({
  loader: async ({ params }) => {
    const data = await getAllData()
    const folder = data.folders.find((f) => slugify(f.name) === params.folderSlug)
    const feed = data.feeds.find(
      (f) => slugify(f.name) === params.feedSlug && f.folderId === folder?.id
    )
    return {
      ...data,
      folderSlug: params.folderSlug,
      feedSlug: params.feedSlug,
      folderId: folder?.id ?? null,
      feedId: feed?.id ?? null,
      feedName: feed?.name ?? null,
    }
  },
  component: FeedPage,
})

function FeedPage() {
  const data = Route.useLoaderData()
  const { feedSlug, feedName, feedId, folderId } = data

  if (!feedId) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-500 text-sm">
        Feed "{feedSlug}" not found.
      </div>
    )
  }

  const folder = data.folders.find((f) => f.id === folderId)

  return (
    <RSSShell
      initialData={{ folders: data.folders, feeds: data.feeds, articles: data.articles as any }}
      title={feedName || "Feed"}
      folderName={folder?.name}
      folderId={folderId ?? undefined}
      filterArticles={(articles) => articles.filter((a) => a.feedId === feedId)}
    />
  )
}

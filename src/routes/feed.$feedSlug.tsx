import { createFileRoute } from "@tanstack/react-router"
import { getAllData } from "@/server/rss"
import { RSSShell } from "@/components/RSSShell"
import { slugify } from "@/lib/slugify"

export const Route = createFileRoute("/feed/$feedSlug")({
  loader: async ({ params }) => {
    const data = await getAllData()
    // Look for a feed with matching slug that has NO folder
    const feed = data.feeds.find(
      (f) => slugify(f.name) === params.feedSlug && !f.folderId
    )
    return {
      ...data,
      feedSlug: params.feedSlug,
      feedId: feed?.id ?? null,
      feedName: feed?.name ?? null,
    }
  },
  component: StandaloneFeedPage,
})

function StandaloneFeedPage() {
  const data = Route.useLoaderData()
  const { feedSlug, feedName, feedId } = data

  if (!feedId) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-500 text-sm">
        Standalone feed "{feedSlug}" not found.
      </div>
    )
  }

  return (
    <RSSShell
      initialData={{ folders: data.folders, feeds: data.feeds, articles: data.articles as any }}
      title={feedName || "Feed"}
      filterArticles={(articles) => articles.filter((a) => a.feedId === feedId)}
    />
  )
}

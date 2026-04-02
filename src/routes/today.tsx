import { createFileRoute } from "@tanstack/react-router"
import { RSSShell } from "@/components/RSSShell"
import { getAllData } from "@/server/rss"

export const Route = createFileRoute("/today")({
  loader: async () => {
    return await getAllData()
  },
  component: TodayPage,
})

function TodayPage() {
  const data = Route.useLoaderData()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return (
    <RSSShell
      initialData={{ folders: data.folders, feeds: data.feeds, articles: data.articles as any }}
      title="Today"
      filterArticles={(articles) =>
        articles.filter((a) => a.publishedAt && new Date(a.publishedAt) >= todayStart)
      }
    />
  )
}

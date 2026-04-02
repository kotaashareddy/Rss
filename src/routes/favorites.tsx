import { createFileRoute } from "@tanstack/react-router"
import { RSSShell } from "@/components/RSSShell"
import { getAllData } from "@/server/rss"

export const Route = createFileRoute("/favorites")({
  loader: async () => {
    return await getAllData()
  },
  component: FavoritesPage,
})

function FavoritesPage() {
  const data = Route.useLoaderData()
  return (
    <RSSShell
      initialData={{ folders: data.folders, feeds: data.feeds, articles: data.articles as any }}
      title="Favorites"
      filterArticles={(articles) => articles.filter((a) => (a as any).isFavorite)}
    />
  )
}

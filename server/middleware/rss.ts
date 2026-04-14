import { defineEventHandler, setResponseHeader, createError, getRequestURL } from "h3"
import Database from "better-sqlite3"
import { join } from "path"

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, "-")
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return ""
  return unsafe.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&": return "&amp;"
      case "<": return "&lt;"
      case ">": return "&gt;"
      case "\"": return "&quot;"
      case "'": return "&apos;"
      default: return m
    }
  })
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  if (!pathname.endsWith("/feed")) return

  const db = new Database(join(process.cwd(), "rss.db"))
  try {
    const slugParts = pathname.split("/").filter(Boolean).slice(0, -1)

    if (slugParts.length === 0) return

    const folders = db.prepare("SELECT * FROM folders").all() as any[]
    const allFeeds = db.prepare("SELECT * FROM feeds").all() as any[]

    const folderSlug = slugParts[0]
    const folder = folders.find((f) => slugify(f.name) === folderSlug)

    let targetFeedIds: string[] = []
    let channelTitle = ""

    if (folder) {
      channelTitle = folder.name
      if (slugParts.length === 1) {
        targetFeedIds = allFeeds.filter((f) => f.folder_id === folder.id).map((f) => f.id)
      } else if (slugParts.length === 2) {
        const feedSlug = slugParts[1]
        const feed = allFeeds.find((f) => f.folder_id === folder.id && slugify(f.name) === feedSlug)
        if (feed) {
          targetFeedIds = [feed.id]
          channelTitle = feed.name
        }
      }
    } else if (slugParts.length === 2 && slugParts[0] === "feed") {
      // Standalone feed fallback (e.g. /feed/my-feed/feed)
      const feedSlug = slugParts[1]
      const feed = allFeeds.find((f) => !f.folder_id && slugify(f.name) === feedSlug)
      if (feed) {
        targetFeedIds = [feed.id]
        channelTitle = feed.name
      }
    }

    if (targetFeedIds.length === 0) return

    const placeholders = targetFeedIds.map(() => "?").join(",")
    const articles = targetFeedIds.length > 0
      ? db.prepare(`SELECT * FROM articles WHERE feed_id IN (${placeholders}) ORDER BY published_at DESC LIMIT 50`).all(...targetFeedIds) as any[]
      : []

    const itemsXml = articles.map((article) => {
      const enclosure = article.image
        ? `<enclosure url="${escapeXml(article.image)}" type="image/jpeg" length="0"/>`
        : ""

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.link)}</link>
      <description>${escapeXml(article.description || "")}</description>
      <pubDate>${article.published_at ? new Date(article.published_at).toUTCString() : ""}</pubDate>
      ${enclosure}
    </item>`
    }).join("\n")

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>http://localhost:3000</link>
    <description>Latest articles</description>
${itemsXml}
  </channel>
</rss>`

    setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8")
    return xml
  } catch (err) {
    console.error("RSS Middleware Error:", err)
  } finally {
    db.close()
  }
})

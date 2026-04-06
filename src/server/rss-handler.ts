import { defineEventHandler, setResponseHeader } from "h3"
import Database from "better-sqlite3"
import { join } from "path"

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-")
}

export default defineEventHandler(async (event) => {
  const url = event.node?.req?.url
  if (!url || !url.split("?")[0].endsWith("/feed")) return

  const db = new Database(join(process.cwd(), "rss.db"))
  try {
    const rawPath = url.split("?")[0]
    const parts = rawPath.split("/").filter(Boolean).slice(0, -1) // remove 'feed'

    const allFolders = db.prepare("SELECT * FROM folders").all() as any[]
    const allFeeds = db.prepare("SELECT * FROM feeds").all() as any[]

    let title = ""
    let description = ""
    let targetFeedIds: string[] = []

    if (parts.length === 1) {
      const folderSlug = parts[0]
      const folder = allFolders.find(f => slugify(f.name) === folderSlug)
      if (folder) {
        title = `${folder.name} - RSS Feed`
        description = `All articles in the ${folder.name} folder.`
        targetFeedIds = allFeeds.filter(f => f.folderId === folder.id).map(f => f.id)
      }
    } else if (parts.length === 2) {
      const folderSlug = parts[0]
      const feedSlug = parts[1]
      const folder = allFolders.find(f => slugify(f.name) === folderSlug)
      if (folder) {
        const feed = allFeeds.find(f => slugify(f.name) === feedSlug && f.folderId === folder.id)
        if (feed) {
          title = `${feed.name} - RSS Feed`
          description = `Articles from the ${feed.name} feed.`
          targetFeedIds = [feed.id]
        }
      }
    }

    if (targetFeedIds.length === 0) return

    const placeholders = targetFeedIds.map(() => "?").join(",")
    const articles = db.prepare(`SELECT * FROM articles WHERE feedId IN (${placeholders}) ORDER BY publishedAt DESC LIMIT 50`).all(...targetFeedIds) as any[]

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title><![CDATA[${title}]]></title>
    <link>http://localhost:3000/${parts.join("/")}</link>
    <description><![CDATA[${description}]]></description>
    ${articles.map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${a.link}</link>
      <description><![CDATA[${a.description || ""}]]></description>
      <pubDate>${a.publishedAt ? new Date(a.publishedAt).toUTCString() : ""}</pubDate>
      <guid isPermaLink="false">${a.id}</guid>
      ${a.image ? `<media:content url="${a.image}" medium="image" />` : ""}
    </item>`).join("")}
  </channel>
</rss>`

    setResponseHeader(event, "Content-Type", "application/xml")
    return xml
  } catch (e) {
    console.error("RSS Final Handler Error:", e)
    throw e
  } finally {
    db.close()
  }
})

import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { db } from "@/db/index"
import { folders, feeds, articles } from "@/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import Parser from "rss-parser"
import { randomUUID } from "crypto"

//─────────────────────────────────────────────
// FETCH ALL DATA
//─────────────────────────────────────────────

export const getAllData = createServerFn({ method: "GET" }).handler(async () => {
  const [allFolders, allFeeds, allArticles] = await Promise.all([
    db.select().from(folders).orderBy(folders.createdAt),
    db.select().from(feeds).orderBy(feeds.createdAt),
    db.select().from(articles).orderBy(desc(articles.publishedAt)),
  ])
  return { folders: allFolders, feeds: allFeeds, articles: allArticles }
})

//─────────────────────────────────────────────
// CREATE FOLDER
//─────────────────────────────────────────────

export const createFolder = createServerFn({ method: "POST" })
  .inputValidator((d: any) => z.object({ name: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const [folder] = await db
      .insert(folders)
      .values({ id: randomUUID(), name: data.name })
      .returning()
    return folder
  })

//─────────────────────────────────────────────
// CREATE FEED + FETCH RSS ARTICLES
//─────────────────────────────────────────────

export const createFeed = createServerFn({ method: "POST" })
  .inputValidator((d: any) => z.object({
      name: z.string().min(1),
      url: z.string().url(),
      folderId: z.string().nullable(),
      includeKeywords: z.array(z.string()),
      excludeKeywords: z.array(z.string()),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const [feed] = await db
      .insert(feeds)
      .values({
        id: randomUUID(),
        name: data.name,
        url: data.url,
        folderId: data.folderId,
        includeKeywords: data.includeKeywords,
        excludeKeywords: data.excludeKeywords,
      })
      .returning()

    try {
      await fetchAndInsertArticles(feed.id, data.url)
    } catch (e) {
      console.error("RSS fetch failed:", e)
    }

    return feed
  })

//─────────────────────────────────────────────
// REFRESH ALL FEEDS
//─────────────────────────────────────────────

export const refreshAllFeeds = createServerFn({ method: "POST" }).handler(async () => {
  const allFeeds = await db.select().from(feeds)
  const results = await Promise.allSettled(
    allFeeds.map((f: { id: string; url: string }) => fetchAndInsertArticles(f.id, f.url))
  )
  const inserted = results.reduce(
    (acc: number, r) => acc + (r.status === "fulfilled" ? r.value : 0),
    0
  )
  return { inserted }
})

//─────────────────────────────────────────────
// SHARED: fetch + parse + insert articles
//─────────────────────────────────────────────

type RssItem = {
  link?: string
  title?: string
  contentSnippet?: string
  summary?: string
  pubDate?: string
  mediaContent?: { $?: { url?: string } }
  mediaThumbnail?: { $?: { url?: string } }
  enclosure?: { url?: string; type?: string }
  itunes?: { image?: string }
}

async function fetchAndInsertArticles(feedId: string, url: string): Promise<number> {
  const parser = new Parser<object, RssItem>({
    customFields: {
      item: [
        ["media:content", "mediaContent", { keepArray: false }],
        ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
        ["enclosure", "enclosure", { keepArray: false }],
      ],
    },
  })

  const feed = await parser.parseURL(url)
  let inserted = 0

  const itemsToProcess = feed.items.slice(0, 6)

  const itemsWithImages = await Promise.all(
    itemsToProcess.map(async (item) => {
      if (!item.link) return item

      let image: string | null = null
      
      // Always try to grab high-res OG image first (parallelized so it's fast)
      try {
        const res = await fetch(item.link, {
          headers: { "User-Agent": "Mozilla/5.0 RSSReader/1.0" },
          signal: AbortSignal.timeout(1500),
        })
        const html = await res.text()
        const match =
          html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ??
          html.match(/content="([^"]+)"[^>]+property="og:image"/i) ??
          html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i)
        if (match?.[1]) image = match[1]
      } catch {
        // ignore
      }

      // Fallbacks if OG Image fails
      if (!image && item.mediaContent?.$?.url) {
        image = item.mediaContent.$.url
      } else if (!image && item.enclosure?.url && item.enclosure.type?.startsWith("image")) {
        image = item.enclosure.url
      } else if (!image && item.itunes?.image) {
        image = item.itunes.image
      } else if (!image && item.mediaThumbnail?.$?.url) {
        // Use blurry thumbnail as last resort
        image = item.mediaThumbnail.$.url
      }

      return { ...item, parsedImage: image }
    })
  )

  for (const item of itemsWithImages) {
    if (!item.link) continue

    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.link, item.link))
      .limit(1)

    if (existing.length > 0) continue

    await db.insert(articles).values({
      id: randomUUID(),
      feedId,
      title: item.title ?? "Untitled",
      description: item.contentSnippet ?? item.summary ?? null,
      link: item.link,
      image: (item as any).parsedImage,
      publishedAt: item.pubDate ? new Date(item.pubDate) : null,
    })
    inserted++
  }

  return inserted
}

//─────────────────────────────────────────────
// ARTICLE ACTIONS
//─────────────────────────────────────────────

export const toggleBookmark = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), state: z.boolean() }))
  .handler(async ({ data }) => {
    await db.update(articles).set({ isBookmarked: data.state }).where(eq(articles.id, data.id))
  })

export const toggleReadLater = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), state: z.boolean() }))
  .handler(async ({ data }) => {
    await db.update(articles).set({ isReadLater: data.state }).where(eq(articles.id, data.id))
  })

export const toggleFavorite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), state: z.boolean() }))
  .handler(async ({ data }) => {
    await db.update(articles).set({ isFavorite: data.state }).where(eq(articles.id, data.id))
  })

export const deleteFeed = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(articles).where(eq(articles.feedId, data.id));
    await db.delete(feeds).where(eq(feeds.id, data.id));
  })

export const deleteFolder = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // manually cascade
    const childFeeds = await db.select({ id: feeds.id }).from(feeds).where(eq(feeds.folderId, data.id));
    if (childFeeds.length > 0) {
      const feedIds = childFeeds.map(f => f.id);
      await db.delete(articles).where(inArray(articles.feedId, feedIds));
    }
    await db.delete(feeds).where(eq(feeds.folderId, data.id));
    await db.delete(folders).where(eq(folders.id, data.id));
  })

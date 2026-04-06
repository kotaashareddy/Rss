// import { defineConfig } from "vite"
// import { devtools } from "@tanstack/devtools-vite"
// import { tanstackStart } from "@tanstack/react-start/plugin/vite"
// import viteReact from "@vitejs/plugin-react"
// import viteTsConfigPaths from "vite-tsconfig-paths"
// import tailwindcss from "@tailwindcss/vite"
// import { nitro } from "nitro/vite"

// import Database from "better-sqlite3"
// import { join } from "path"

// function slugify(name: string): string {
//   return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-")
// }

// const rssPlugin = () => ({
//   name: "rss-xml",
//   configureServer(server: any) {
//     server.middlewares.use(async (req: any, res: any, next: any) => {
//       const url = req.url?.split("?")[0]
//       if (url?.endsWith("/feed")) {
//         const db = new Database(join(process.cwd(), "rss.db"))
//         try {
//           const parts = url.split("/").filter(Boolean).slice(0, -1)
//           const allFolders = db.prepare("SELECT * FROM folders").all() as any[]
//           const allFeeds = db.prepare("SELECT * FROM feeds").all() as any[]

//           let title = ""
//           let description = ""
//           let targetFeedIds: string[] = []

//           if (parts.length === 1) {
//             const folder = allFolders.find(f => slugify(f.name) === parts[0])
//             if (folder) {
//               title = `${folder.name} - RSS Feed`
//               description = `All articles in the ${folder.name} folder.`
//               targetFeedIds = allFeeds.filter(f => f.folderId === folder.id).map(f => f.id)
//             }
//           } else if (parts.length === 2) {
//             const folder = allFolders.find(f => slugify(f.name) === parts[0])
//             if (folder) {
//               const feed = allFeeds.find(f => slugify(f.name) === parts[1] && f.folderId === folder.id)
//               if (feed) {
//                 title = `${feed.name} - RSS Feed`
//                 description = `Articles from the ${feed.name} feed.`
//                 targetFeedIds = [feed.id]
//               }
//             }
//           }

//           if (targetFeedIds.length > 0) {
//             const placeholders = targetFeedIds.map(() => "?").join(",")
//             const articles = db.prepare(`SELECT * FROM articles WHERE feedId IN (${placeholders}) ORDER BY publishedAt DESC LIMIT 50`).all(...targetFeedIds) as any[]
//             const xml = `<?xml version="1.0" encoding="UTF-8" ?>
// <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
//   <channel>
//     <title><![CDATA[${title}]]></title>
//     <link>http://localhost:3000/${parts.join("/")}</link>
//     <description><![CDATA[${description}]]></description>
//     ${articles.map(a => `
//     <item>
//       <title><![CDATA[${a.title}]]></title>
//       <link>${a.link}</link>
//       <description><![CDATA[${a.description || ""}]]></description>
//       <pubDate>${a.publishedAt ? new Date(a.publishedAt).toUTCString() : ""}</pubDate>
//       <guid isPermaLink="false">${a.id}</guid>
//       ${a.image ? `<media:content url="${a.image}" medium="image" />` : ""}
//     </item>`).join("")}
//   </channel>
// </rss>`
//             res.setHeader("Content-Type", "application/xml")
//             res.end(xml)
//             return
//           }
//         } catch (e) {
//           console.error("RSS Plugin Error:", e)
//         } finally {
//           db.close()
//         }
//       }
//       next()
//     })
//   },
// })

// const config = defineConfig({
//   plugins: [
//     devtools(),
//     rssPlugin(),
//     // this is the plugin that enables path aliases
//     viteTsConfigPaths({
//       projects: ["./tsconfig.json"],
//     }),
//     tailwindcss(),
//     tanstackStart(),
//     viteReact(),
//   ],
// })

// export default config
import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import Database from "better-sqlite3"
import { join } from "path"

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-")
}

const rssPlugin = () => ({
  name: "rss-xml",
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = req.url?.split("?")[0]
      if (url?.endsWith("/feed")) {
        const db = new Database(join(process.cwd(), "rss.db"))
        try {
          const parts = url.split("/").filter(Boolean).slice(0, -1)
          const allFolders = db.prepare("SELECT * FROM folders").all() as any[]
          const allFeeds = db.prepare("SELECT * FROM feeds").all() as any[]
          let title = ""
          let description = ""
          let targetFeedIds: string[] = []

          if (parts.length === 1) {
            const folder = allFolders.find(f => slugify(f.name) === parts[0])
            if (folder) {
              title = `${folder.name} - RSS Feed`
              description = `All articles in the ${folder.name} folder.`
              targetFeedIds = allFeeds.filter(f => f.folder_id === folder.id).map(f => f.id)
            }
          } else if (parts.length === 2) {
            const folder = allFolders.find(f => slugify(f.name) === parts[0])
            if (folder) {
              const feed = allFeeds.find(f => slugify(f.name) === parts[1] && f.folder_id === folder.id)
              if (feed) {
                title = `${feed.name} - RSS Feed`
                description = `Articles from the ${feed.name} feed.`
                targetFeedIds = [feed.id]
              }
            }
          }

          if (targetFeedIds.length > 0) {
            const placeholders = targetFeedIds.map(() => "?").join(",")
            const articles = db.prepare(
              `SELECT * FROM articles WHERE feed_id IN (${placeholders}) ORDER BY published_at DESC LIMIT 50`
            ).all(...targetFeedIds) as any[]

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
      <pubDate>${a.published_at ? new Date(a.published_at).toUTCString() : ""}</pubDate>
      <guid isPermaLink="false">${a.id}</guid>
      ${a.image ? `<media:content url="${a.image}" medium="image" />` : ""}
    </item>`).join("")}
  </channel>
</rss>`

            res.setHeader("Content-Type", "application/xml")
            res.end(xml)
            return
          }
        } catch (e) {
          console.error("RSS Plugin Error:", e)
        } finally {
          db.close()
        }
      }
      next()
    })
  },
})

const config = defineConfig({
  plugins: [
    devtools(),
    rssPlugin(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

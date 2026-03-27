import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

export const folders = pgTable('folders', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const feeds = pgTable('feeds', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    folderId: text('folder_id').references(() => folders.id),
    includeKeywords: text('include_keywords').array(),
    excludeKeywords: text('exclude_keywords').array(),
    createdAt: timestamp('created_at').defaultNow(),
})

export const articles = pgTable('articles', {
    id: text('id').primaryKey(),
    feedId: text('feed_id').references(() => feeds.id),
    title: text('title').notNull(),
    description: text('description'),
    link: text('link').notNull(),
    image: text('image'),
    publishedAt: timestamp('published_at'),
    isUsed: boolean('is_used').default(false),
    visitCount: integer('visit_count').default(0),
    isBookmarked: boolean('is_bookmarked').default(false),
    isReadLater: boolean('is_read_later').default(false),
    isFavorite: boolean('is_favorite').default(false),
    createdAt: timestamp('created_at').defaultNow(),
})
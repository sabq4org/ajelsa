/**
 * Ajel Newspaper — Database Schema
 * Built with Drizzle ORM + Neon PostgreSQL
 */

import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uuid,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =====================================================
// ENUMS
// =====================================================

export const userRoleEnum = pgEnum("user_role", [
  "super_admin", // مدير عام
  "editor_in_chief", // رئيس تحرير
  "editor", // محرر
  "writer", // كاتب
  "contributor", // مساهم
]);

export const articleStatusEnum = pgEnum("article_status", [
  "draft", // مسودة
  "review", // قيد المراجعة
  "scheduled", // مجدول للنشر
  "published", // منشور
  "archived", // مؤرشف
]);

export const articleTypeEnum = pgEnum("article_type", [
  "regular", // عادي
  "breaking", // عاجل
  "exclusive", // حصري
  "investigation", // تحقيق
  "opinion", // رأي
  "video", // فيديو
  "photo", // فوتوغرافي
]);

// =====================================================
// USERS — المحررون والكتّاب
// =====================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),

    fullName: varchar("full_name", { length: 200 }).notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),

    role: userRoleEnum("role").notNull().default("writer"),

    // social
    twitterHandle: varchar("twitter_handle", { length: 50 }),

    // account state
    isActive: boolean("is_active").notNull().default(true),
    emailVerifiedAt: timestamp("email_verified_at"),
    lastLoginAt: timestamp("last_login_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
  ]
);

// =====================================================
// CATEGORIES — الأقسام
// =====================================================

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    nameEn: varchar("name_en", { length: 100 }),
    description: text("description"),

    // hierarchy
    parentId: uuid("parent_id"),

    // visual
    color: varchar("color", { length: 7 }).default("#8c1d2b"),
    icon: varchar("icon", { length: 50 }),

    // SEO
    metaTitle: varchar("meta_title", { length: 200 }),
    metaDescription: text("meta_description"),

    // ordering
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("categories_slug_idx").on(t.slug),
    index("categories_parent_idx").on(t.parentId),
  ]
);

// =====================================================
// TAGS — الوسوم
// =====================================================

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    usageCount: integer("usage_count").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tags_slug_idx").on(t.slug)]
);

// =====================================================
// ARTICLES — الأخبار والمقالات
// =====================================================

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 250 }).notNull().unique(),

    // content
    title: varchar("title", { length: 300 }).notNull(),
    subtitle: varchar("subtitle", { length: 500 }),
    excerpt: text("excerpt"),
    contentHtml: text("content_html"), // rendered html
    contentJson: jsonb("content_json"), // tiptap json

    // media
    featuredImageUrl: text("featured_image_url"),
    featuredImageAlt: varchar("featured_image_alt", { length: 300 }),
    featuredImageCaption: text("featured_image_caption"),

    // classification
    type: articleTypeEnum("type").notNull().default("regular"),
    status: articleStatusEnum("status").notNull().default("draft"),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),

    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),

    editorId: uuid("editor_id").references(() => users.id),

    // SEO
    metaTitle: varchar("meta_title", { length: 200 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    canonicalUrl: text("canonical_url"),

    // social
    ogImageUrl: text("og_image_url"),

    // workflow
    isBreaking: boolean("is_breaking").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPinned: boolean("is_pinned").notNull().default(false),
    allowComments: boolean("allow_comments").notNull().default(true),

    // scheduling
    publishedAt: timestamp("published_at"),
    scheduledAt: timestamp("scheduled_at"),

    // stats (denormalized for speed)
    viewCount: integer("view_count").notNull().default(0),
    commentCount: integer("comment_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    readingTimeMinutes: integer("reading_time_minutes"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("articles_slug_idx").on(t.slug),
    index("articles_status_published_idx").on(t.status, t.publishedAt),
    index("articles_category_idx").on(t.categoryId),
    index("articles_author_idx").on(t.authorId),
    index("articles_type_idx").on(t.type),
    index("articles_breaking_idx").on(t.isBreaking, t.publishedAt),
    index("articles_featured_idx").on(t.isFeatured, t.publishedAt),
    index("articles_scheduled_idx").on(t.status, t.scheduledAt),
  ]
);

// =====================================================
// ARTICLE_TAGS — رابط بين الأخبار والوسوم (M:N)
// =====================================================

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.tagId] })]
);

// =====================================================
// ARTICLE_REVISIONS — مراجعات المقالات
// =====================================================

export const articleRevisions = pgTable(
  "article_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    contentJson: jsonb("content_json"),
    revisedBy: uuid("revised_by")
      .notNull()
      .references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("revisions_article_idx").on(t.articleId)]
);

// =====================================================
// COMMENTS — التعليقات
// =====================================================

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),

    authorName: varchar("author_name", { length: 100 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }),
    content: text("content").notNull(),

    isApproved: boolean("is_approved").notNull().default(false),
    isSpam: boolean("is_spam").notNull().default(false),

    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("comments_article_idx").on(t.articleId),
    index("comments_approved_idx").on(t.isApproved, t.articleId),
  ]
);

// =====================================================
// MEDIA — مكتبة الصور والملفات
// =====================================================

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: varchar("filename", { length: 250 }).notNull(),
    originalFilename: varchar("original_filename", { length: 250 }),
    url: text("url").notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    sizeBytes: integer("size_bytes"),
    width: integer("width"),
    height: integer("height"),
    altText: varchar("alt_text", { length: 300 }),
    caption: text("caption"),
    uploadedBy: uuid("uploaded_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("media_uploaded_by_idx").on(t.uploadedBy),
    index("media_created_idx").on(t.createdAt),
  ]
);

// =====================================================
// PAGE_VIEWS — تتبع الزيارات (مبسط)
// =====================================================

export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articleId: uuid("article_id").references(() => articles.id, {
      onDelete: "cascade",
    }),
    sessionHash: varchar("session_hash", { length: 64 }),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    country: varchar("country", { length: 2 }),
    deviceType: varchar("device_type", { length: 20 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("views_article_date_idx").on(t.articleId, t.createdAt),
    index("views_session_idx").on(t.sessionHash),
  ]
);

// =====================================================
// SETTINGS — إعدادات الموقع
// =====================================================

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// =====================================================
// RELATIONS
// =====================================================

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  uploads: many(media),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
    relationName: "author",
  }),
  editor: one(users, {
    fields: [articles.editorId],
    references: [users.id],
    relationName: "editor",
  }),
  tags: many(articleTags),
  revisions: many(articleRevisions),
  comments: many(comments),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articles: many(articleTags),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

// =====================================================
// TYPE EXPORTS
// =====================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Media = typeof media.$inferSelect;

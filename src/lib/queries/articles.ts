/**
 * Article queries — Public-facing reads
 */

import { db, articles, categories, users, articleTags, tags } from "@/lib/db";
import { eq, and, desc, sql, inArray, gt, isNotNull } from "drizzle-orm";
import { cacheRemember } from "@/lib/redis";

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  featuredImageUrl: string | null;
  type: string;
  isBreaking: boolean;
  publishedAt: Date | null;
  viewCount: number;
  commentCount: number;
  readingTimeMinutes: number | null;
  category: { name: string; slug: string };
  author: { fullName: string };
};

const PUBLISHED_FILTER = and(
  eq(articles.status, "published"),
  isNotNull(articles.publishedAt)
);

const HOME_FILTER = and(
  PUBLISHED_FILTER,
  eq(articles.excludeFromHome, false)
);

/** أحدث الأخبار (للصفحة الرئيسية — تستثني excludeFromHome) */
export async function getLatestArticles(limit = 10): Promise<ArticleListItem[]> {
  return db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      subtitle: articles.subtitle,
      excerpt: articles.excerpt,
      featuredImageUrl: articles.featuredImageUrl,
      type: articles.type,
      isBreaking: articles.isBreaking,
      publishedAt: articles.publishedAt,
      viewCount: articles.viewCount,
      commentCount: articles.commentCount,
      readingTimeMinutes: articles.readingTimeMinutes,
      category: {
        name: categories.name,
        slug: categories.slug,
      },
      author: {
        fullName: users.fullName,
      },
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(HOME_FILTER)
    .orderBy(desc(articles.publishedAt))
    .limit(limit) as unknown as Promise<ArticleListItem[]>;
}

/** الأخبار العاجلة (للتيكر) */
export async function getBreakingHeadlines(limit = 5): Promise<string[]> {
  const rows = await db
    .select({ title: articles.title })
    .from(articles)
    .where(and(PUBLISHED_FILTER, eq(articles.isBreaking, true)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return rows.map((r) => r.title);
}

/** الأكثر قراءة (آخر 7 أيام) */
export async function getMostReadArticles(limit = 5): Promise<ArticleListItem[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      subtitle: articles.subtitle,
      excerpt: articles.excerpt,
      featuredImageUrl: articles.featuredImageUrl,
      type: articles.type,
      isBreaking: articles.isBreaking,
      publishedAt: articles.publishedAt,
      viewCount: articles.viewCount,
      commentCount: articles.commentCount,
      readingTimeMinutes: articles.readingTimeMinutes,
      category: { name: categories.name, slug: categories.slug },
      author: { fullName: users.fullName },
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(PUBLISHED_FILTER, gt(articles.publishedAt, sevenDaysAgo)))
    .orderBy(desc(articles.viewCount))
    .limit(limit) as unknown as Promise<ArticleListItem[]>;
}

/** المميزة على الصفحة الرئيسية */
export async function getFeaturedArticles(limit = 5): Promise<ArticleListItem[]> {
  return db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      subtitle: articles.subtitle,
      excerpt: articles.excerpt,
      featuredImageUrl: articles.featuredImageUrl,
      type: articles.type,
      isBreaking: articles.isBreaking,
      publishedAt: articles.publishedAt,
      viewCount: articles.viewCount,
      commentCount: articles.commentCount,
      readingTimeMinutes: articles.readingTimeMinutes,
      category: { name: categories.name, slug: categories.slug },
      author: { fullName: users.fullName },
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(HOME_FILTER, eq(articles.isFeatured, true)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit) as unknown as Promise<ArticleListItem[]>;
}

/** خبر بالـ slug */
export async function getArticleBySlug(slug: string) {
  const [row] = await db
    .select({
      article: articles,
      category: categories,
      author: users,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);

  if (!row?.article) return null;

  // get tags
  const tagRows = await db
    .select({
      id: tags.id,
      slug: tags.slug,
      name: tags.name,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, row.article.id));

  return { ...row, tags: tagRows };
}

/** أخبار قسم */
export async function getCategoryArticles(
  categorySlug: string,
  limit = 20,
  offset = 0
) {
  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      featuredImageUrl: articles.featuredImageUrl,
      isBreaking: articles.isBreaking,
      publishedAt: articles.publishedAt,
      viewCount: articles.viewCount,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: users.fullName,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        eq(articles.status, "published" as any),
        isNotNull(articles.publishedAt),
        eq(categories.slug, categorySlug)
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  // تحويل البيانات للشكل المتوقع من StoryCard
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    featuredImageUrl: r.featuredImageUrl,
    isBreaking: r.isBreaking,
    publishedAt: r.publishedAt,
    viewCount: r.viewCount,
    category: { name: r.categoryName ?? "", slug: r.categorySlug ?? "" },
    author: r.authorName ? { fullName: r.authorName } : null,
  }));
}

/** كل الأقسام (بدون cache لضمان البيانات الحديثة) */
export async function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.position);
}

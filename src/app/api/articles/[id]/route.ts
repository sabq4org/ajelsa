/**
 * /api/articles/[id] — single article ops
 */

import { NextRequest, NextResponse } from "next/server";
import { db, articles, articleRevisions } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { z } from "zod";
import { stripHtml, readingTimeMinutes } from "@/lib/utils";
import { cacheDeletePattern } from "@/lib/redis";
import { indexArticle, removeArticleFromIndex } from "@/lib/search";

const updateSchema = z.object({
  title: z.string().min(5).max(300).optional(),
  subtitle: z.string().max(500).optional(),
  excerpt: z.string().max(500).optional(),
  contentHtml: z.string().optional(),
  contentJson: z.any().optional(),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  type: z.enum(["regular", "breaking", "exclusive", "investigation", "opinion", "video", "photo"]).optional(),
  status: z.enum(["draft", "review", "scheduled", "published", "archived"]).optional(),
  isBreaking: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  featuredImageUrl: z.string().url().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogImageUrl: z.string().optional(),
  canonicalUrl: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!article) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("writer");
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Save revision before update
    const [existing] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

    if (data.contentJson || data.title) {
      await db.insert(articleRevisions).values({
        articleId: id,
        title: existing.title,
        contentJson: existing.contentJson,
        revisedBy: session.userId,
      });
    }

    const updates: any = { ...data, updatedAt: new Date() };

    if (data.contentHtml) {
      const cleanText = stripHtml(data.contentHtml);
      updates.readingTimeMinutes = readingTimeMinutes(cleanText);
    }

    if (data.status === "published" && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }

    if (data.scheduledAt) {
      updates.scheduledAt = new Date(data.scheduledAt);
    }

    const [updated] = await db
      .update(articles)
      .set(updates)
      .where(eq(articles.id, id))
      .returning();

    await cacheDeletePattern("articles:*");

    if (updated.status === "published") {
      indexArticle({
        id: updated.id,
        title: updated.title,
        excerpt: updated.excerpt ?? undefined,
        slug: updated.slug,
        categoryName: "",
        categorySlug: "",
        authorName: session.fullName,
        tags: [],
        type: updated.type,
        isBreaking: updated.isBreaking,
        publishedAt: updated.publishedAt ? Math.floor(updated.publishedAt.getTime() / 1000) : 0,
        featuredImageUrl: updated.featuredImageUrl ?? undefined,
      }).catch(() => {});
    } else if (updated.status === "archived") {
      removeArticleFromIndex(updated.id).catch(() => {});
    }

    // Determine audit action
    const auditAction = data.status === "published" && existing.status !== "published"
      ? "article_published"
      : data.status === "archived"
      ? "article_archived"
      : "article_updated";

    await logAction({
      userId: session.userId,
      userFullName: session.fullName,
      action: auditAction,
      entityType: "article",
      entityId: updated.id,
      entityTitle: updated.title,
      details: data.status ? { status: data.status, previousStatus: existing.status } : undefined,
    });

    return NextResponse.json({ article: updated });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "صلاحيات غير كافية" }, { status: 403 });
    if (err.message === "UNAUTHENTICATED") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const delSession = await requireRole("editor_in_chief");
    const { id } = await params;
    const [deleted] = await db.select({ title: articles.title }).from(articles).where(eq(articles.id, id)).limit(1);
    await db.delete(articles).where(eq(articles.id, id));
    await cacheDeletePattern("articles:*");
    removeArticleFromIndex(id).catch(() => {});

    await logAction({
      userId: delSession.userId,
      userFullName: delSession.fullName,
      action: "article_deleted",
      entityType: "article",
      entityId: id,
      entityTitle: deleted?.title,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

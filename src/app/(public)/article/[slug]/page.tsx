import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/queries/articles";
import { formatRelativeTime, formatNumber, formatArabicDate } from "@/lib/utils";
import { Eye, MessageCircle, Share2, Clock, Tag as TagIcon } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await getArticleBySlug(slug);
    if (!data) return { title: "غير موجود" };

    const a = data.article;
    return {
      title: a.metaTitle ?? a.title,
      description: a.metaDescription ?? a.excerpt ?? undefined,
      openGraph: {
        title: a.title,
        description: a.excerpt ?? undefined,
        images: a.ogImageUrl ?? a.featuredImageUrl ?? undefined,
        type: "article",
        publishedTime: a.publishedAt?.toISOString(),
        authors: data.author?.fullName ? [data.author.fullName] : undefined,
      },
    };
  } catch {
    return { title: "خبر" };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data;
  try {
    data = await getArticleBySlug(slug);
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <article className="max-w-3xl mx-auto px-8 py-16 text-center">
        <div className="font-serif text-6xl text-burgundy mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">الخبر غير موجود</h1>
        <p className="text-ink-soft">قد يكون قد تم نقله أو حذفه</p>
      </article>
    );
  }

  const { article, category, author, tags } = data;

  return (
    <article className="max-w-3xl mx-auto px-8 py-12">
      {/* Category */}
      {category && (
        <div className="text-center mb-5">
          <span className="pill-burgundy">{category.name}</span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-ink leading-tight text-center mb-4 -tracking-[0.02em]">
        {article.title}
      </h1>

      {article.subtitle && (
        <p className="text-xl text-ink-2 leading-relaxed text-center mb-8">
          {article.subtitle}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center justify-center gap-5 text-xs text-ink-soft pb-6 mb-8 border-b border-line">
        {author && (
          <span>
            بقلم{" "}
            <span className="text-ink font-semibold">{author.fullName}</span>
          </span>
        )}
        <span className="w-1 h-1 rounded-full bg-ink-faint" />
        <span>
          {article.publishedAt ? formatArabicDate(article.publishedAt) : ""}
        </span>
        {article.readingTimeMinutes && (
          <>
            <span className="w-1 h-1 rounded-full bg-ink-faint" />
            <span className="flex items-center gap-1">
              <Clock size={11} /> {article.readingTimeMinutes} دقيقة قراءة
            </span>
          </>
        )}
      </div>

      {/* Featured image */}
      {article.featuredImageUrl && (
        <figure className="mb-10">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-paper border border-line">
            <img
              src={article.featuredImageUrl}
              alt={article.featuredImageAlt ?? article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {article.featuredImageCaption && (
            <figcaption className="text-xs text-ink-soft text-center mt-3 italic">
              {article.featuredImageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Excerpt as lead paragraph */}
      {article.excerpt && (
        <p className="text-xl text-ink-2 leading-loose mb-8 font-medium border-r-4 border-burgundy pr-5">
          {article.excerpt}
        </p>
      )}

      {/* Body */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-ink prose-p:text-ink-2 prose-p:leading-loose prose-a:text-burgundy prose-blockquote:border-burgundy prose-blockquote:font-serif prose-blockquote:text-ink prose-strong:text-ink"
        dangerouslySetInnerHTML={{
          __html: article.contentHtml ?? "<p>لا يوجد محتوى</p>",
        }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-line">
          <TagIcon size={14} className="text-ink-faint" />
          {tags.map((tag) => (
            <a
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="text-xs px-3 py-1.5 rounded-full bg-bg-2 text-ink-2 hover:bg-rose-cream hover:text-burgundy transition-colors"
            >
              {tag.name}
            </a>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mt-10 text-sm text-ink-soft">
        <span className="flex items-center gap-2">
          <Eye size={16} /> {formatNumber(article.viewCount)} قراءة
        </span>
        <span className="flex items-center gap-2">
          <MessageCircle size={16} /> {article.commentCount} تعليق
        </span>
        <span className="flex items-center gap-2">
          <Share2 size={16} /> {article.shareCount} مشاركة
        </span>
      </div>
    </article>
  );
}

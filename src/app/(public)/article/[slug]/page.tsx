// تحديث صفحة الخبر كل 60 ثانية (ISR)
export const revalidate = 60;

import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug } from "@/lib/queries/articles";
import { formatArabicDate } from "@/lib/utils";
import { Tag as TagIcon, Sparkles } from "lucide-react";
import { ReadingProgress } from "@/components/public/ReadingProgress";
import { ArticleSidebar } from "@/components/public/ArticleSidebar";
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
    <>
      {/* شريط تقدم القراءة في الأعلى */}
      <ReadingProgress />

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-12">
        {/* Layout: Article + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">

          {/* ━━━━━━━━━━━━ المقال ━━━━━━━━━━━━ */}
          <article className="max-w-none lg:max-w-3xl mx-auto w-full">
            {/* Category */}
            {category && (
              <div className="mb-5">
                <Link href={`/category/${category.slug}`}>
                  <span className="pill-burgundy">{category.name}</span>
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink leading-tight mb-4 -tracking-[0.02em]">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-lg md:text-xl text-ink-2 leading-relaxed mb-6">
                {article.subtitle}
              </p>
            )}

            {/* Meta — author and date only */}
            <div className="flex items-center gap-4 text-xs text-ink-soft pb-6 mb-8 border-b border-line">
              {author && (
                <span>
                  بقلم{" "}
                  <span className="text-ink font-semibold">{author.fullName}</span>
                </span>
              )}
              {author && article.publishedAt && (
                <span className="w-1 h-1 rounded-full bg-ink-faint" />
              )}
              {article.publishedAt && (
                <span>{formatArabicDate(article.publishedAt)}</span>
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
                  {(article.featuredImageUrl.includes("ai-generated") ||
                    article.featuredImageUrl.includes("cloudinary") ||
                    article.featuredImageUrl.startsWith("data:")) && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-lg">
                      <Sparkles size={11} className="text-yellow-300" />
                      مولدة بالذكاء الاصطناعي
                    </div>
                  )}
                </div>
                {article.featuredImageCaption && (
                  <figcaption className="text-xs text-ink-soft text-center mt-3 italic">
                    {article.featuredImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Excerpt as lead */}
            {article.excerpt && (
              <p className="text-lg md:text-xl text-ink-2 leading-loose mb-8 font-medium border-r-4 border-burgundy pr-5">
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
              <div className="flex items-center gap-3 mt-10 pt-6 border-t border-line flex-wrap">
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

            {/* الكلمات المفتاحية */}
            {article.metaKeywords && (
              <div className="mt-6 pt-5 border-t border-line">
                <p className="text-[11px] font-semibold text-ink-soft tracking-widest mb-3 uppercase">
                  كلمات مفتاحية
                </p>
                <div className="flex flex-wrap gap-2">
                  {(article.metaKeywords as string).split(/[،,]+/).map((kw, i) =>
                    kw.trim() ? (
                      <Link
                        key={i}
                        href={`/keyword/${encodeURIComponent(kw.trim())}`}
                        className="text-xs px-3 py-1.5 rounded-full border border-line text-ink-2 bg-bg-2 hover:bg-rose-cream hover:text-burgundy hover:border-burgundy/30 transition-all"
                      >
                        # {kw.trim()}
                      </Link>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </article>

          {/* ━━━━━━━━━━━━ Sidebar الإبداعي ━━━━━━━━━━━━ */}
          <ArticleSidebar
            articleId={article.id}
            articleTitle={article.title}
            articleSlug={article.slug}
            articleContent={article.contentHtml ?? ""}
            publishedAt={article.publishedAt}
            readingTimeMinutes={article.readingTimeMinutes}
            viewCount={article.viewCount ?? 0}
            commentCount={article.commentCount ?? 0}
          />
        </div>
      </div>
    </>
  );
}

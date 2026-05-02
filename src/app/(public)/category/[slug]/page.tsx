export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { StoryCard } from "@/components/public/StoryCard";
import { getCategoryArticles, getActiveCategories } from "@/lib/queries/articles";
import { Newspaper } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let categoryName = "";
  let articles: any[] = [];

  try {
    const [cats, items] = await Promise.all([
      getActiveCategories(),
      getCategoryArticles(slug, 24, 0),
    ]);

    const cat = cats.find((c: any) => c.slug === slug);
    if (!cat) return notFound();

    categoryName = cat.name;
    articles = items as any[];
  } catch {
    return notFound();
  }

  return (
    <div className="max-w-[1320px] mx-auto px-8 py-9">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-burgundy relative">
        <h1 className="text-3xl font-extrabold text-ink flex items-center gap-3">
          <span className="text-burgundy">
            <Newspaper size={26} />
          </span>
          {categoryName}
        </h1>
        <span className="text-sm text-ink-soft">
          {articles.length > 0 ? `${articles.length}+ خبر` : ""}
        </span>
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="py-24 text-center text-ink-soft">
          <p className="text-xl font-semibold mb-2">لا توجد أخبار في هذا القسم بعد</p>
          <p className="text-sm">ارجع لاحقاً أو تصفح الأقسام الأخرى</p>
          <Link
            href="/"
            className="mt-6 inline-block bg-burgundy text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-burgundy-dark transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      ) : (
        <>
          {/* Lead + side */}
          {articles.length >= 2 && (
            <section className="grid lg:grid-cols-[1.6fr_1fr] gap-8 mb-10">
              <StoryCard article={articles[0]} variant="lead" />
              <div className="space-y-5">
                {articles.slice(1, 5).map((a, i) => (
                  <StoryCard key={i} article={a} variant="side" />
                ))}
              </div>
            </section>
          )}

          {/* Rest as rows */}
          {articles.length > 5 && (
            <section>
              <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-line relative">
                <span className="absolute -bottom-px right-0 w-15 h-0.5 bg-burgundy" style={{ width: 60 }} />
                <h2 className="text-xl font-bold text-ink">المزيد من {categoryName}</h2>
              </div>
              <div>
                {articles.slice(5).map((a, i) => (
                  <StoryCard key={i} article={a} variant="row" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

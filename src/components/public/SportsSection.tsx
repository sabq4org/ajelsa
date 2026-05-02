import Link from "next/link";
import { Trophy, ArrowLeft, Clock, Eye, Flame } from "lucide-react";
import { formatRelativeTime, formatNumber } from "@/lib/utils";

interface Article {
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  isBreaking?: boolean;
  publishedAt?: Date | null;
  viewCount?: number;
  category?: { name: string; slug: string } | null;
}

interface Props {
  articles: Article[];
}

/**
 * Sports Section — خلفية ممتدة على كامل عرض الصفحة
 * بطاقة كبيرة + 3 صغيرة بأسلوب احترافي
 */
export function SportsSection({ articles }: Props) {
  if (articles.length === 0) return null;

  const main = articles[0];
  const others = articles.slice(1, 4);

  return (
    <section className="relative -mx-4 lg:-mx-8">
      {/* خلفية ممتدة بنمط رياضي */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-[#0d3d2e] to-emerald-950 overflow-hidden">
        {/* نمط الملعب الزخرفي */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* دوائر ضبابية مزخرفة */}
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" />

        {/* خط زخرفي علوي */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-transparent via-emerald-400/40 to-transparent" />

        <div className="relative max-w-[1320px] mx-auto px-4 lg:px-8 py-12">

          {/* العنوان */}
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center shadow-lg shadow-emerald-500/30">
                <Trophy size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white -tracking-[0.02em] flex items-center gap-2">
                  الرياضة
                </h2>
                <p className="text-[12px] text-emerald-200/80 mt-0.5">
                  أحدث أخبار الملاعب والبطولات
                </p>
              </div>
            </div>

            <Link
              href="/category/sports"
              className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-400 hover:text-white text-emerald-200 backdrop-blur-sm border border-emerald-400/30 hover:border-emerald-400 px-5 py-2 rounded-xl text-[13px] font-bold transition-all hover:gap-3"
            >
              كل أخبار الرياضة
              <ArrowLeft size={14} />
            </Link>
          </div>

          {/* الشبكة */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">

            {/* البطاقة الكبيرة */}
            <Link
              href={`/article/${main.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-emerald-950 border border-emerald-700/40 hover:border-emerald-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {main.featuredImageUrl ? (
                  <img
                    src={main.featuredImageUrl}
                    alt={main.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-emerald-900 grid place-items-center">
                    <Trophy size={64} className="text-emerald-400/30" />
                  </div>
                )}
                {/* gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent" />

                {main.isBreaking && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-burgundy text-white px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest shadow-lg">
                    <Flame size={10} />
                    عاجل
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 p-5 lg:p-6">
                  <span className="inline-block bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest mb-3 shadow-lg">
                    {main.category?.name ?? "رياضة"}
                  </span>

                  <h3 className="text-xl lg:text-2xl font-extrabold text-white leading-tight mb-2 group-hover:text-emerald-200 transition-colors -tracking-[0.01em]">
                    {main.title}
                  </h3>

                  {main.excerpt && (
                    <p className="text-[13px] text-white/80 leading-relaxed line-clamp-2 mb-3 hidden md:block">
                      {main.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-emerald-200/70">
                    {main.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(main.publishedAt)}
                      </span>
                    )}
                    {main.viewCount != null && main.viewCount > 0 && (
                      <>
                        <span className="w-0.5 h-0.5 rounded-full bg-emerald-400/40" />
                        <span className="flex items-center gap-1">
                          <Eye size={10} />
                          {formatNumber(main.viewCount)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {/* البطاقات الصغيرة */}
            <div className="space-y-3">
              {others.map((a, i) => (
                <Link
                  key={i}
                  href={`/article/${a.slug}`}
                  className="group flex gap-3 p-3 rounded-xl bg-emerald-950/50 backdrop-blur-sm border border-emerald-700/30 hover:border-emerald-400/40 hover:bg-emerald-900/60 transition-all"
                >
                  <div className="relative w-24 h-20 lg:w-28 lg:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-emerald-800">
                    {a.featuredImageUrl ? (
                      <img
                        src={a.featuredImageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 grid place-items-center">
                        <Trophy size={20} className="text-emerald-400/40" />
                      </div>
                    )}
                    {a.isBreaking && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-burgundy text-white grid place-items-center shadow-md">
                        <Flame size={9} />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                      {a.category?.name ?? "رياضة"}
                    </span>
                    <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-2 group-hover:text-emerald-200 transition-colors -tracking-[0.01em]">
                      {a.title}
                    </h3>
                    {a.publishedAt && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-300/60">
                        <Clock size={9} />
                        {formatRelativeTime(a.publishedAt)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

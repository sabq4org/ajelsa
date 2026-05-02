// تحديث الصفحة كل 30 ثانية (ISR)
export const revalidate = 30;

import {
  getLatestArticles,
  getMostReadArticles,
  getFeaturedArticles,
} from "@/lib/queries/articles";
import { Newspaper, Clock, Eye, Flame } from "lucide-react";
import { formatRelativeTime, formatNumber } from "@/lib/utils";

import { LivePulseBar } from "@/components/public/LivePulseBar";
import { HeroSection } from "@/components/public/HeroSection";
import { AIBriefWidget } from "@/components/public/AIBriefWidget";
import { EditorsPicks } from "@/components/public/EditorsPicks";
import { MostReadStrip } from "@/components/public/MostReadStrip";
import { NewsletterHero } from "@/components/public/NewsletterHero";
import { SectionHeader } from "@/components/public/SectionHeader";

// Fallback demo data (تستخدم فقط لو DB فاضية تماماً)
const FALLBACK_LEAD: any = {
  slug: "saudi-private-sector-2026",
  title: "قرارات سعودية غير مسبوقة لدعم القطاع الخاص في 2026",
  excerpt: "حزمة تحفيزية شاملة تطلقها وزارة المالية بالشراكة مع 12 جهة حكومية، تستهدف رفع مساهمة القطاع الخاص في الناتج المحلي إلى 65%.",
  isBreaking: true,
  publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  viewCount: 128400,
  category: { name: "محليات", slug: "local" },
  author: { fullName: "أحمد العمري" },
};

export default async function HomePage() {
  let lead: any = null;
  let sideStories: any[] = [];
  let latest: any[] = [];
  let mostRead: any[] = [];
  let editorsPicks: any[] = [];
  let hasRealData = false;

  try {
    const [featured, latestArticles, mostReadArticles] = await Promise.all([
      getFeaturedArticles(8),
      getLatestArticles(50),
      getMostReadArticles(5),
    ]);

    hasRealData = featured.length > 0 || latestArticles.length > 0;

    if (featured.length > 0) {
      lead = featured[0];
      sideStories = featured.slice(1, 5);
      // اختيارات المحرر = الأخبار المميزة بعد الـ Hero
      editorsPicks = featured.slice(5, 8);
    } else if (latestArticles.length > 0) {
      lead = latestArticles[0];
      sideStories = latestArticles.slice(1, 5);
    }

    latest = latestArticles;
    mostRead = mostReadArticles.length > 0 ? mostReadArticles : latestArticles.slice(0, 5);
  } catch {
    // DB غير متصلة
  }

  const showLead = lead ?? FALLBACK_LEAD;
  const showSide = sideStories.length > 0 ? sideStories : (hasRealData ? [] : []);
  const briefArticles = hasRealData ? latest.slice(0, 5) : [];

  return (
    <>
      {/* ━━━━━━━━━━━━ Live Pulse Bar ━━━━━━━━━━━━ */}
      <LivePulseBar />

      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-8 space-y-12">

        {/* ━━━━━━━━━━━━ Hero Section ━━━━━━━━━━━━ */}
        <HeroSection lead={showLead} side={showSide} />

        {/* ━━━━━━━━━━━━ AI Daily Brief ━━━━━━━━━━━━ */}
        {briefArticles.length > 0 && (
          <AIBriefWidget articles={briefArticles} />
        )}

        {/* ━━━━━━━━━━━━ آخر الأخبار — شبكة موحدة أنيقة ━━━━━━━━━━━━ */}
        {latest.length > sideStories.length + 1 && (
          <section>
            <SectionHeader
              icon={<Newspaper size={18} />}
              title="آخر الأخبار"
              subtitle="جميع الأخبار بترتيب النشر"
              href="/latest"
              hrefLabel="عرض الكل"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latest.slice(sideStories.length + 1).map((a: any, i: number) => (
                <a
                  key={i}
                  href={`/article/${a.slug}`}
                  className="group bg-paper rounded-2xl border border-line overflow-hidden hover:border-burgundy/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                >
                  {/* الصورة */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-rose-cream">
                    {a.featuredImageUrl ? (
                      <img
                        src={a.featuredImageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-burgundy/10 via-rose-cream to-burgundy/5" />
                    )}
                    {a.isBreaking && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-burgundy text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider shadow-lg">
                        <Flame size={9} />
                        عاجل
                      </div>
                    )}
                  </div>

                  {/* المحتوى */}
                  <div className="p-5 flex-1 flex flex-col">
                    {a.category && (
                      <span className="text-[10px] font-bold text-burgundy uppercase tracking-widest mb-2 block">
                        {a.category.name}
                      </span>
                    )}

                    <h3 className="text-[15px] font-extrabold text-ink leading-snug line-clamp-2 group-hover:text-burgundy transition-colors mb-3 -tracking-[0.01em] flex-1">
                      {a.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[10px] text-ink-soft pt-2 border-t border-line-soft">
                      {a.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={9} />
                          {formatRelativeTime(a.publishedAt)}
                        </span>
                      )}
                      {a.viewCount != null && a.viewCount > 0 && (
                        <>
                          <span className="w-0.5 h-0.5 rounded-full bg-ink-faint" />
                          <span className="flex items-center gap-1">
                            <Eye size={9} />
                            {formatNumber(a.viewCount)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ━━━━━━━━━━━━ Editor's Picks ━━━━━━━━━━━━ */}
        {editorsPicks.length > 0 && (
          <EditorsPicks articles={editorsPicks} />
        )}

        {/* ━━━━━━━━━━━━ Most Read Today ━━━━━━━━━━━━ */}
        {mostRead.length > 0 && (
          <MostReadStrip articles={mostRead} />
        )}



        {/* ━━━━━━━━━━━━ Newsletter Hero ━━━━━━━━━━━━ */}
        <NewsletterHero />
      </div>
    </>
  );
}

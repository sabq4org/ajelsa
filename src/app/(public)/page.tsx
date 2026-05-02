// تحديث الصفحة كل 30 ثانية (ISR)
export const revalidate = 30;

import {
  getLatestArticles,
  getMostReadArticles,
  getFeaturedArticles,
} from "@/lib/queries/articles";
import { LivePulseBar } from "@/components/public/LivePulseBar";
import { HeroSection } from "@/components/public/HeroSection";
import { AIBriefWidget } from "@/components/public/AIBriefWidget";
import { EditorsPicks } from "@/components/public/EditorsPicks";
import { MostReadStrip } from "@/components/public/MostReadStrip";
import { NewsletterHero } from "@/components/public/NewsletterHero";
import { LatestNewsGrid } from "@/components/public/LatestNewsGrid";

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

        {/* ━━━━━━━━━━━━ آخر الأخبار — يعرض كل الأخبار ━━━━━━━━━━━━ */}
        {latest.length > 0 && (
          <LatestNewsGrid articles={latest} />
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

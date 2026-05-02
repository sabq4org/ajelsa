export const dynamic = "force-dynamic";

import { StoryCard } from "@/components/public/StoryCard";
import {
  getLatestArticles,
  getMostReadArticles,
  getFeaturedArticles,
} from "@/lib/queries/articles";
import { Newspaper, Flame, Mail } from "lucide-react";
import Link from "next/link";

// Fallback demo data when DB is empty
const FALLBACK_DATA = {
  lead: {
    slug: "saudi-private-sector-2026",
    title: "قرارات سعودية غير مسبوقة لدعم القطاع الخاص في 2026",
    excerpt:
      "حزمة تحفيزية شاملة تُطلقها وزارة المالية بالشراكة مع 12 جهة حكومية، تستهدف رفع مساهمة القطاع الخاص في الناتج المحلي إلى 65% خلال السنوات الخمس القادمة، ضمن مستهدفات رؤية 2030.",
    isBreaking: true,
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    viewCount: 128400,
    commentCount: 234,
    category: { name: "محليات", slug: "local" },
    author: { fullName: "أحمد العمري" },
  },
  side: [
    {
      slug: "green-falcons-asian-cup",
      title: "الأخضر يحجز مقعده في النصف نهائي بثلاثية تاريخية",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      category: { name: "رياضة", slug: "sports" },
      viewCount: 89000,
    },
    {
      slug: "tasi-banking-rally",
      title: "تاسي يقفز 1.8% بدعم من القطاع المصرفي",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      category: { name: "اقتصاد", slug: "business" },
      viewCount: 67000,
    },
    {
      slug: "gcc-summit-riyadh",
      title: "قمة استثنائية تجمع قادة الخليج في الرياض",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      category: { name: "عالم", slug: "world" },
      viewCount: 54000,
    },
    {
      slug: "saudi-ai-platform",
      title: "المملكة تُطلق منصة وطنية للذكاء الاصطناعي",
      publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      category: { name: "تقنية", slug: "tech" },
      viewCount: 41000,
    },
  ],
  latest: [
    {
      slug: "cabinet-flexible-work",
      title: "مجلس الوزراء يعتمد لائحة جديدة لتنظيم العمل المرن في القطاع الخاص",
      excerpt:
        "اعتمد مجلس الوزراء اللائحة التنفيذية الجديدة التي تستهدف تنظيم بيئة العمل المرن وتعزيز فرص التشغيل للكوادر الوطنية في القطاع الخاص.",
      publishedAt: new Date(Date.now() - 30 * 60 * 1000),
      viewCount: 18400,
      commentCount: 47,
      category: { name: "محليات", slug: "local" },
      author: { fullName: "أحمد العمري" },
    },
    {
      slug: "inflation-decline-april",
      title: "انخفاض جديد في معدلات التضخم خلال أبريل بنسبة 0.3%",
      excerpt:
        "أعلنت الهيئة العامة للإحصاء عن انخفاض في معدل التضخم السنوي خلال شهر أبريل، مدعوماً بتراجع أسعار المواد الغذائية والمواصلات.",
      publishedAt: new Date(Date.now() - 60 * 60 * 1000),
      viewCount: 24600,
      commentCount: 89,
      category: { name: "اقتصاد", slug: "business" },
      author: { fullName: "ريم الشهري" },
    },
    {
      slug: "climate-summit-riyadh",
      title: "قمة المناخ العالمية تنطلق في الرياض الأسبوع القادم بمشاركة 80 دولة",
      excerpt:
        "تستضيف العاصمة الرياض قمة المناخ العالمية بمشاركة قادة وممثلين من 80 دولة لمناقشة استراتيجيات الحياد الكربوني.",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      viewCount: 31200,
      commentCount: 56,
      category: { name: "عالم", slug: "world" },
      author: { fullName: "خالد القحطاني" },
    },
    {
      slug: "mawzn-arabic-ai",
      title: "موزن تُطلق أول مساعد ذكاء اصطناعي عربي بقدرات متقدمة",
      excerpt:
        "كشفت شركة موزن السعودية عن إطلاق مساعدها الذكي الجديد المدعوم بنماذج لغوية مطورة محلياً، بقدرات تنافس أحدث النماذج العالمية.",
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      viewCount: 22100,
      commentCount: 38,
      category: { name: "تقنية", slug: "tech" },
      author: { fullName: "نوف العتيبي" },
    },
  ],
  mostRead: [
    "قرارات سعودية غير مسبوقة لدعم القطاع الخاص في 2026",
    "الأخضر يحجز مقعده في النصف نهائي بثلاثية تاريخية",
    "تاسي يقفز 1.8% بدعم من القطاع المصرفي",
    "قمة استثنائية تجمع قادة الخليج في الرياض",
    "المملكة تُطلق منصة وطنية للذكاء الاصطناعي",
  ],
};

export default async function HomePage() {
  let lead: any = null;
  let sideStories: any[] = [];
  let latest: any[] | null = null;
  let mostRead: any[] | null = null;

  try {
    const [featured, latestArticles, mostReadArticles] = await Promise.all([
      getFeaturedArticles(5),
      getLatestArticles(12),
      getMostReadArticles(5),
    ]);

    if (featured.length > 0) {
      lead = featured[0];
      sideStories = featured.slice(1, 5);
    } else if (latestArticles.length > 0) {
      // لو ما فيه مميزة، استخدم أحدث الأخبار
      lead = latestArticles[0];
      sideStories = latestArticles.slice(1, 5);
    }

    latest = latestArticles.length > 0 ? latestArticles.slice(lead ? 5 : 0) : null;
    mostRead = mostReadArticles.length > 0 ? mostReadArticles : null;
  } catch {
    // DB not connected — show demo
  }

  // Use fallback if no real data
  const showLead = lead ?? FALLBACK_DATA.lead;
  const showSide = sideStories.length > 0 ? sideStories : FALLBACK_DATA.side;
  const showLatest = latest ?? FALLBACK_DATA.latest;
  const showMostRead = mostRead?.map((a) => a.title) ?? FALLBACK_DATA.mostRead;

  return (
    <div className="max-w-[1320px] mx-auto px-8 py-9">
      {/* HERO */}
      <section className="grid lg:grid-cols-[1.6fr_1fr] gap-8 mb-10">
        <StoryCard article={showLead} variant="lead" />
        <div className="space-y-5">
          {showSide.map((s, i) => (
            <StoryCard key={i} article={s as any} variant="side" />
          ))}
        </div>
      </section>

      {/* LATEST + SIDEBAR */}
      <section className="grid lg:grid-cols-[2fr_1fr] gap-10 py-8">
        <div>
          <SectionHead icon={<Newspaper size={18} />} title="آخر الأخبار" href="/latest" />
          <div>
            {showLatest.map((a, i) => (
              <StoryCard key={i} article={a as any} variant="row" />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          {/* Most read */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-burgundy to-burgundy-dark text-white px-5 py-3.5 flex items-center gap-2 font-bold text-sm">
              <Flame size={16} />
              الأكثر قراءة
            </div>
            <div className="py-1">
              {showMostRead.map((title, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex items-start gap-3.5 px-5 py-3.5 border-b border-line-soft last:border-b-0 hover:bg-bg-2 transition-colors"
                >
                  <span className="font-serif text-2xl font-bold text-burgundy/80 leading-none min-w-6">
                    {["١", "٢", "٣", "٤", "٥"][i]}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink leading-relaxed">
                      {title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-gradient-to-br from-burgundy to-burgundy-dark text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={18} />
                <h3 className="text-lg font-bold">نشرة عاجل</h3>
              </div>
              <p className="text-xs opacity-85 mb-4">
                آخر الأخبار في بريدك كل صباح
              </p>
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/95 text-ink text-sm outline-none mb-2 placeholder:text-ink-faint"
              />
              <button className="w-full bg-white text-burgundy py-2.5 rounded-lg text-xs font-bold hover:bg-rose-cream transition-colors">
                اشترك مجاناً
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SectionHead({
  icon,
  title,
  href,
}: {
  icon?: React.ReactNode;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-7 pb-3 border-b border-line relative">
      <span className="absolute -bottom-px right-0 w-15 h-0.5 bg-burgundy" style={{ width: 60 }} />
      <h2 className="text-2xl font-extrabold text-ink flex items-center gap-2.5 -tracking-[0.01em]">
        {icon && <span className="text-burgundy">{icon}</span>}
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-sm text-burgundy font-semibold hover:text-burgundy-dark">
          شاهد الكل ←
        </Link>
      )}
    </div>
  );
}

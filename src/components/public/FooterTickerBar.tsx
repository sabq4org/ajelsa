import Link from "next/link";
import { Flame } from "lucide-react";
import { getBreakingHeadlines, getLatestArticles } from "@/lib/queries/articles";

/**
 * شريط الأخبار العاجلة المتحرك — يظهر قبل الفوتر
 */
export async function FooterTickerBar() {
  let headlines: { title: string; slug: string }[] = [];

  try {
    // نجلب آخر 5 أخبار للشريط
    const latest = await getLatestArticles(5);
    headlines = latest.map((a) => ({
      title: a.title,
      slug: a.slug,
    }));
  } catch {
    // fallback صامت
  }

  if (headlines.length === 0) return null;

  return (
    <div className="bg-gradient-to-l from-burgundy-dark via-burgundy to-burgundy-dark text-white py-3 overflow-hidden border-y border-burgundy-dark/40 shadow-inner relative">
      {/* تأثير ضوء يتحرك */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-[1320px] mx-auto px-8 flex items-center gap-4 relative">
        <div className="bg-white text-burgundy px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-widest flex items-center gap-1.5 flex-shrink-0 shadow-sm">
          <Flame size={11} />
          آخر الأخبار
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap group">
          <div className="inline-block animate-ticker group-hover:[animation-play-state:paused]">
            {[...headlines, ...headlines].map((h, i) => (
              <Link
                key={i}
                href={`/article/${h.slug}`}
                className="ml-12 text-[13px] font-medium hover:text-rose-cream transition-colors"
              >
                <span className="opacity-50 ml-3.5 text-[10px]">◆</span>
                {h.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

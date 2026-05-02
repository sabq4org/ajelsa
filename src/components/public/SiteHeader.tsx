/**
 * SiteHeader — صحيفة عاجل (تصميم احترافي 2026)
 * - شريط علوي بمعلومات سياقية (هجري + ميلادي + تاسي)
 * - ترويسة (Masthead) كلاسيكية مع زخارف عنابية
 * - شريط أقسام مع تأثير Hover Underline أنيق
 * - شريط عاجل مع نبضة هادئة
 */

import Link from "next/link";
import { formatArabicDate } from "@/lib/utils";
import { Search, Bell, Menu, Moon, TrendingUp } from "lucide-react";

const STATIC_NAV: Array<{ label: string; href: string }> = [
  { label: "الرئيسية", href: "/" },
  { label: "آخر الأخبار", href: "/latest" },
];

// تاريخ هجري
function formatHijriDate(d: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatter.format(d).replace("هـ", "").trim() + " هـ";
  } catch {
    return "";
  }
}

export function SiteHeader({
  breakingHeadlines = [],
  navCategories = [],
}: {
  breakingHeadlines?: string[];
  navCategories?: Array<{ name: string; slug: string }>;
}) {
  const navItems = [
    ...STATIC_NAV,
    ...navCategories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
  ];

  const today = new Date();
  const hijriDate = formatHijriDate(today);
  const gregorianDate = formatArabicDate(today);

  return (
    <>
      {/* ━━━━━━━━━━━━ شريط علوي رفيع وأنيق ━━━━━━━━━━━━ */}
      <div className="bg-ink text-ink-faint text-[11px] py-2.5 relative z-10 border-b border-burgundy/40">
        <div className="max-w-[1320px] mx-auto px-8 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <span className="font-medium">{gregorianDate}</span>
            {hijriDate && (
              <>
                <span className="w-px h-3 bg-white/15" />
                <span className="opacity-80">{hijriDate}</span>
              </>
            )}
            <span className="w-px h-3 bg-white/15" />
            <span className="flex items-center gap-1.5 text-emerald-400">
              <TrendingUp size={11} />
              <span className="font-semibold">تاسي</span>
              <span className="opacity-90">+1.2%</span>
            </span>
            <span className="w-px h-3 bg-white/15" />
            <span>الرياض 28°</span>
          </div>
          <div className="flex gap-5 items-center">
            <Link href="/notifications" className="hover:text-white transition-colors">الإشعارات</Link>
            <Link href="/newsletter" className="hover:text-white transition-colors">النشرة</Link>
            <Link href="/login" className="hover:text-white transition-colors font-semibold">تسجيل الدخول</Link>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━ الترويسة الفخمة (Masthead) ━━━━━━━━━━━━ */}
      <header className="bg-paper py-8 relative z-10">
        <div className="max-w-[1320px] mx-auto px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">

            {/* اليسار: شارة البث المباشر */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-rose-cream text-burgundy px-3.5 py-2 rounded-full text-[11px] font-bold tracking-wider">
                <span className="live-dot" />
                البث المباشر
              </div>
            </div>

            {/* الوسط: الشعار */}
            <Link href="/" className="text-center group flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="صحيفة عاجل"
                className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>

            {/* اليمين: أيقونات أنيقة */}
            <div className="flex items-center gap-2 justify-end">
              <button className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy hover:border-rose-soft transition-all">
                <Search size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy hover:border-rose-soft transition-all">
                <Bell size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy hover:border-rose-soft transition-all">
                <Moon size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy hover:border-rose-soft transition-all md:hidden">
                <Menu size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━ شريط الأقسام مع خط مزدوج فخم ━━━━━━━━━━━━ */}
      <nav className="bg-paper sticky top-0 z-40 shadow-soft relative">
        {/* خط مزدوج فاصل */}
        <div className="absolute top-0 inset-x-0 h-px bg-burgundy/40" />
        <div className="absolute top-1 inset-x-0 h-px bg-burgundy/15" />
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-burgundy" />

        <div className="max-w-[1320px] mx-auto px-8">
          <div className="flex items-center justify-between gap-2">
            <ul className="flex">
              {navItems.map((item) => (
                <li key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="block py-4 px-4 text-[14px] font-bold text-ink hover:text-burgundy transition-colors"
                  >
                    {item.label}
                  </Link>
                  {/* خط ينمو من الوسط عند Hover */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0 bg-burgundy rounded-t group-hover:w-[70%] transition-all duration-300 ease-out z-10" />
                </li>
              ))}
            </ul>

            <form className="flex items-center gap-2 bg-bg border border-line rounded-xl px-3.5 py-1.5 w-60 hover:border-burgundy/40 transition-colors">
              <Search size={14} className="text-ink-soft" />
              <input
                type="search"
                placeholder="ابحث في عاجل..."
                className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-faint"
              />
            </form>
          </div>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━ شريط عاجل ━━━━━━━━━━━━ */}
      {breakingHeadlines.length > 0 && (
        <div className="bg-burgundy text-white py-2.5 overflow-hidden shadow-red relative">
          {/* تأثير ضوء يتحرك خفيف */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="max-w-[1320px] mx-auto px-8 flex items-center gap-4 relative">
            <div className="bg-white text-burgundy px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider flex items-center gap-1.5 flex-shrink-0 shadow-sm">
              <span className="live-dot" />
              عاجل
            </div>
            <div className="flex-1 overflow-hidden whitespace-nowrap group">
              <div className="inline-block animate-ticker group-hover:[animation-play-state:paused]">
                {breakingHeadlines.map((h, i) => (
                  <span key={i} className="ml-12 text-sm font-medium">
                    <span className="opacity-40 ml-3.5 text-[10px]">◆</span>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

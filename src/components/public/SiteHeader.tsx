/**
 * SiteHeader — صحيفة عاجل (تصميم فخم 2026)
 * مستوحى من الصحف الكلاسيكية مع لمسات عصرية
 */

import Link from "next/link";
import { formatArabicDate } from "@/lib/utils";
import { Search, Bell, Sun, Mail } from "lucide-react";

const STATIC_NAV: Array<{ label: string; href: string }> = [
  { label: "الرئيسية", href: "/" },
];

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

  return (
    <>
      {/* ───────────── شريط علوي رفيع وأنيق ───────────── */}
      <div className="bg-paper border-b border-line-soft text-ink-soft text-[11px] py-2 relative z-10">
        <div className="max-w-[1320px] mx-auto px-8 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <span className="font-medium">{formatArabicDate(new Date())}</span>
            <span className="w-px h-2.5 bg-line" />
            <span className="flex items-center gap-1.5">
              <Sun size={11} className="text-burgundy" /> الرياض 28°
            </span>
            <span className="w-px h-2.5 bg-line" />
            <span>العصر · 3:42</span>
          </div>
          <div className="flex gap-5 items-center">
            <Link href="/notifications" className="hover:text-burgundy transition-colors">الإشعارات</Link>
            <Link href="/newsletter" className="hover:text-burgundy transition-colors flex items-center gap-1">
              <Mail size={11} /> النشرة
            </Link>
            <Link href="/login" className="hover:text-burgundy transition-colors font-semibold">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>

      {/* ───────────── الترويسة الفخمة (Masthead) ───────────── */}
      <header className="bg-paper py-9 relative z-10">
        <div className="max-w-[1320px] mx-auto px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">

            {/* اليسار: شارة البث المباشر */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold text-burgundy tracking-[3px] uppercase">
                <span className="live-dot" />
                LIVE NOW
              </div>
            </div>

            {/* الوسط: الشعار الفخم */}
            <Link href="/" className="text-center group flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="صحيفة عاجل"
                className="h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="text-[10px] text-ink-soft mt-2 tracking-[6px] font-semibold uppercase">
                صحيفة الحدث الأولى
              </div>
            </Link>

            {/* اليمين: أيقونات أنيقة بدون إطارات */}
            <div className="flex items-center gap-1 justify-end">
              <button className="w-10 h-10 rounded-full grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy transition-all">
                <Search size={16} />
              </button>
              <button className="w-10 h-10 rounded-full grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy transition-all">
                <Bell size={16} />
              </button>
              <button className="bg-burgundy text-white px-4 py-2 rounded-full text-[12px] font-bold mr-2 hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all">
                اشترك
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ───────────── شريط أقسام كلاسيكي مع خط فاصل مزدوج ───────────── */}
      <nav className="bg-paper sticky top-0 z-40 border-y border-burgundy/20 relative">
        {/* خط مزدوج فخم */}
        <div className="absolute top-0 inset-x-0 h-px bg-burgundy/40" />
        <div className="absolute top-1 inset-x-0 h-px bg-burgundy/20" />

        <div className="max-w-[1320px] mx-auto px-8">
          <div className="flex items-center justify-between gap-2">
            <ul className="flex">
              {navItems.map((item) => (
                <li key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="block py-3.5 px-4 text-[14px] font-bold text-ink hover:text-burgundy transition-colors"
                  >
                    {item.label}
                  </Link>
                  {/* تأثير الخط السفلي عند Hover */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0 bg-burgundy rounded-t group-hover:w-[60%] transition-all duration-300" />
                </li>
              ))}
            </ul>

            {/* بحث Minimalist */}
            <form className="flex items-center gap-2 border-b border-line hover:border-burgundy transition-colors py-1.5 w-52">
              <Search size={13} className="text-ink-soft" />
              <input
                type="search"
                placeholder="ابحث في عاجل..."
                className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-ink-faint"
              />
            </form>
          </div>
        </div>
      </nav>

      {/* ───────────── شريط عاجل هادئ وراقي ───────────── */}
      {breakingHeadlines.length > 0 && (
        <div className="bg-rose-cream/40 border-b border-line-soft py-2.5 overflow-hidden">
          <div className="max-w-[1320px] mx-auto px-8 flex items-center gap-4">
            <div className="bg-burgundy text-white px-3 py-1 rounded-md text-[10px] font-extrabold tracking-[2px] uppercase flex items-center gap-1.5 flex-shrink-0">
              <span className="live-dot" />
              عاجل
            </div>
            <div className="flex-1 overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-ticker">
                {breakingHeadlines.map((h, i) => (
                  <span key={i} className="ml-12 text-[13px] font-medium text-ink-2">
                    <span className="opacity-30 ml-3.5 text-[10px] text-burgundy">◆</span>
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

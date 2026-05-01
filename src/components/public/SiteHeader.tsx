/**
 * SiteHeader — صحيفة عاجل
 * Header عام للموقع (top bar + masthead + nav + breaking ticker)
 */

import Link from "next/link";
import { formatArabicDate } from "@/lib/utils";
import { Search, Bell, Menu, Moon } from "lucide-react";

const NAV_ITEMS = [
  { label: "الرئيسية", href: "/", isActive: true },
  { label: "محليات", href: "/category/local" },
  { label: "اقتصاد", href: "/category/business" },
  { label: "رياضة", href: "/category/sports" },
  { label: "عالم", href: "/category/world" },
  { label: "تقنية", href: "/category/tech" },
  { label: "منوعات", href: "/category/lifestyle" },
  { label: "آراء", href: "/category/opinion" },
  { label: "فيديو", href: "/category/video" },
];

export function SiteHeader({ breakingHeadlines = [] }: { breakingHeadlines?: string[] }) {
  return (
    <>
      {/* Top utility bar */}
      <div className="bg-ink text-ink-faint text-xs py-2.5 relative z-10">
        <div className="max-w-[1320px] mx-auto px-8 flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <span>{formatArabicDate(new Date())}</span>
            <span className="w-px h-3 bg-white/15" />
            <span>الرياض 28°</span>
            <span className="w-px h-3 bg-white/15" />
            <span>العصر 3:42</span>
          </div>
          <div className="flex gap-6 items-center">
            <Link href="/notifications" className="hover:text-white">الإشعارات</Link>
            <Link href="/newsletter" className="hover:text-white">البريد</Link>
            <Link href="/login" className="hover:text-white">تسجيل الدخول</Link>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <header className="bg-paper border-b border-line py-7 relative z-10">
        <div className="max-w-[1320px] mx-auto px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-rose-cream text-burgundy px-3.5 py-2 rounded-full text-xs font-semibold">
                <span className="live-dot" />
                البث المباشر
              </div>
            </div>

            <Link href="/" className="text-center group flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="صحيفة عاجل"
                className="h-20 w-auto object-contain"
              />
              <div className="text-xs text-ink-soft mt-2 tracking-[3px] font-medium">
                صحيفة الحدث الأولى
              </div>
            </Link>

            <div className="flex items-center gap-3 justify-end">
              <button className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy hover:border-rose-soft transition-all">
                <Search size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy hover:border-rose-soft transition-all">
                <Moon size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center text-ink-2 hover:bg-rose-cream hover:text-burgundy hover:border-rose-soft transition-all">
                <Menu size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main nav */}
      <nav className="bg-paper border-b-2 border-burgundy sticky top-0 z-40 shadow-soft">
        <div className="max-w-[1320px] mx-auto px-8">
          <div className="flex items-center justify-between gap-2">
            <ul className="flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-3.5 px-4 text-sm font-medium relative transition-colors ${
                      item.isActive
                        ? "text-burgundy font-bold after:content-[''] after:absolute after:bottom-0 after:right-4 after:left-4 after:h-[3px] after:bg-burgundy after:rounded-t"
                        : "text-ink-2 hover:text-burgundy"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <form className="flex items-center gap-2 bg-bg border border-line rounded-xl px-3.5 py-1.5 w-60">
              <Search size={14} className="text-ink-soft" />
              <input
                type="search"
                placeholder="ابحث في عاجل..."
                className="flex-1 bg-transparent outline-none text-sm text-ink"
              />
            </form>
          </div>
        </div>
      </nav>

      {/* Breaking ticker */}
      {breakingHeadlines.length > 0 && (
        <div className="bg-burgundy text-white py-2.5 overflow-hidden shadow-red">
          <div className="max-w-[1320px] mx-auto px-8 flex items-center gap-4">
            <div className="bg-white text-burgundy px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider flex items-center gap-1.5 flex-shrink-0">
              <span className="live-dot" />
              عاجل
            </div>
            <div className="flex-1 overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-ticker">
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

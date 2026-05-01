"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Zap,
  FileText,
  FolderTree,
  Tag,
  Image as ImageIcon,
  MessageCircle,
  Users,
  TrendingUp,
  Settings,
  Search,
  Bell,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_GROUPS = [
  {
    label: "الرئيسية",
    items: [
      { icon: LayoutDashboard, label: "نظرة عامة", href: "/admin" },
      { icon: Newspaper, label: "الأخبار", href: "/admin/articles", badge: 12 },
      { icon: Zap, label: "عاجل الآن", href: "/admin/articles?type=breaking", badge: 3 },
      { icon: FileText, label: "المسودات", href: "/admin/articles?status=draft" },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { icon: FolderTree, label: "الأقسام", href: "/admin/categories" },
      { icon: Tag, label: "الوسوم", href: "/admin/tags" },
      { icon: ImageIcon, label: "المكتبة", href: "/admin/media" },
      { icon: MessageCircle, label: "التعليقات", href: "/admin/comments", badge: 28 },
    ],
  },
  {
    label: "إدارة",
    items: [
      { icon: Users, label: "المحررون", href: "/admin/users" },
      { icon: TrendingUp, label: "التحليلات", href: "/admin/analytics" },
      { icon: Settings, label: "الإعدادات", href: "/admin/settings" },
    ],
  },
];

export function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { fullName: string; role: string };
}) {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen relative z-5">
      {/* SIDEBAR */}
      <aside className="bg-paper border-l border-line p-5 flex flex-col h-screen sticky top-0">
        <Link href="/admin" className="flex flex-col items-start gap-2 pb-6 border-b border-line mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="صحيفة عاجل"
            className="h-12 w-auto object-contain"
          />
          <div className="text-[10px] text-ink-faint tracking-wider">لوحة التحكم</div>
        </Link>

        <nav className="flex-1 overflow-y-auto -mx-1 px-1">
          {MENU_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <div className="text-[10px] text-ink-faint tracking-widest mb-2 px-3">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] mb-0.5 transition-all relative",
                      active
                        ? "bg-rose-cream text-burgundy font-semibold before:content-[''] before:absolute before:right-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-burgundy"
                        : "text-ink-2 hover:bg-bg-2 hover:text-ink"
                    )}
                  >
                    <Icon size={16} className="opacity-85" />
                    <span>{item.label}</span>
                    {item.badge != null && (
                      <span className="mr-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-burgundy text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="bg-bg-2 rounded-xl p-3.5 flex items-center gap-2.5 mt-auto">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-burgundy to-burgundy-soft text-white grid place-items-center font-bold text-sm flex-shrink-0">
            {user?.fullName?.[0] ?? "م"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate">
              {user?.fullName ?? "المستخدم"}
            </div>
            <div className="text-[11px] text-ink-soft">
              {roleLabel(user?.role)}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="p-7 px-8 overflow-x-hidden">{children}</main>
    </div>
  );
}

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    super_admin: "مدير عام",
    editor_in_chief: "رئيس التحرير",
    editor: "محرر",
    writer: "كاتب",
    contributor: "مساهم",
  };
  return map[role ?? ""] ?? "مستخدم";
}

export function AdminTopbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2 -tracking-[0.01em]">
          {title}
          <span className="live-dot" />
        </h1>
        {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
      </div>
      <div className="flex gap-2.5 items-center">
        <div className="flex items-center gap-2 bg-paper border border-line rounded-xl px-3.5 py-2 w-72">
          <Search size={14} className="text-ink-soft" />
          <input
            type="search"
            placeholder="بحث في الأخبار، المحررين، الوسوم..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <button className="w-10 h-10 bg-paper border border-line rounded-xl grid place-items-center text-ink-2 hover:text-burgundy transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-burgundy border-2 border-paper" />
        </button>
        {actions}
      </div>
    </div>
  );
}

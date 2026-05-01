import { AdminTopbar } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { Plus, FileText, Edit3, Trash2, Eye } from "lucide-react";
import { db, articles, categories, users } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { formatRelativeTime, formatNumber } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-bg-2 text-ink-soft" },
  review: { label: "قيد المراجعة", color: "bg-amber-50 text-gold" },
  scheduled: { label: "مجدول", color: "bg-blue-50 text-navy" },
  published: { label: "منشور", color: "bg-emerald-50 text-sage" },
  archived: { label: "مؤرشف", color: "bg-rose-cream text-burgundy" },
};

async function getArticles() {
  try {
    return await db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        status: articles.status,
        type: articles.type,
        isBreaking: articles.isBreaking,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        viewCount: articles.viewCount,
        category: { name: categories.name },
        author: { fullName: users.fullName },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .orderBy(desc(articles.createdAt))
      .limit(50);
  } catch {
    return [];
  }
}

export default async function ArticlesPage() {
  const items = await getArticles();

  // Demo data when DB is empty
  const showItems = items.length > 0 ? items : [
    {
      id: "1",
      slug: "demo-1",
      title: "قرارات سعودية غير مسبوقة لدعم القطاع الخاص في 2026",
      status: "published" as const,
      type: "breaking",
      isBreaking: true,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      viewCount: 128400,
      category: { name: "محليات" },
      author: { fullName: "أحمد العمري" },
    },
    {
      id: "2",
      slug: "demo-2",
      title: "الأخضر يحجز مقعده في النصف نهائي بثلاثية تاريخية",
      status: "published" as const,
      type: "regular",
      isBreaking: false,
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      viewCount: 89000,
      category: { name: "رياضة" },
      author: { fullName: "ريم الشهري" },
    },
    {
      id: "3",
      slug: "demo-3",
      title: "تاسي يقفز 1.8% بدعم من القطاع المصرفي",
      status: "review" as const,
      type: "regular",
      isBreaking: false,
      publishedAt: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      viewCount: 0,
      category: { name: "اقتصاد" },
      author: { fullName: "خالد القحطاني" },
    },
    {
      id: "4",
      slug: "demo-4",
      title: "مقدمة عن الذكاء الاصطناعي في الإعلام السعودي",
      status: "draft" as const,
      type: "regular",
      isBreaking: false,
      publishedAt: null,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      viewCount: 0,
      category: { name: "تقنية" },
      author: { fullName: "علي الحازمي" },
    },
  ];

  return (
    <>
      <AdminTopbar
        title="الأخبار"
        subtitle={`${showItems.length} خبر · إدارة كاملة لمحتوى الموقع`}
        actions={
          <Link
            href="/admin/articles/new"
            className="bg-burgundy text-white px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all"
          >
            <Plus size={14} /> خبر جديد
          </Link>
        }
      />

      {/* Filters */}
      <div className="card mb-5 flex items-center gap-4 p-4">
        <FilterChip label="الكل" count={showItems.length} active />
        <FilterChip
          label="منشور"
          count={showItems.filter((a) => a.status === "published").length}
        />
        <FilterChip
          label="مسودة"
          count={showItems.filter((a) => a.status === "draft").length}
        />
        <FilterChip
          label="قيد المراجعة"
          count={showItems.filter((a) => a.status === "review").length}
        />
        <FilterChip
          label="مجدول"
          count={showItems.filter((a) => a.status === "scheduled").length}
        />
        <FilterChip
          label="عاجل"
          count={showItems.filter((a) => a.isBreaking).length}
          burgundy
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-bg-2">
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide">العنوان</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-32">القسم</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-32">الكاتب</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-28">الحالة</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-28">النشر</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-24">القراءات</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {showItems.map((item) => {
              const status = STATUS_LABELS[item.status] ?? STATUS_LABELS.draft;
              return (
                <tr
                  key={item.id}
                  className="border-b border-line-soft last:border-b-0 hover:bg-bg-2/40 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-2">
                      {item.isBreaking && (
                        <span className="w-1 h-1 rounded-full bg-burgundy mt-2 flex-shrink-0" />
                      )}
                      <span className="text-[14px] text-ink font-medium leading-snug">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-2">
                    {item.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-2">
                    {item.author?.fullName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-ink-soft">
                    {item.publishedAt
                      ? formatRelativeTime(item.publishedAt)
                      : <span className="opacity-50">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink font-semibold tabular-nums">
                    {item.viewCount > 0 ? formatNumber(item.viewCount) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 justify-end">
                      <Link
                        href={`/article/${item.slug}`}
                        target="_blank"
                        className="w-7 h-7 rounded-lg grid place-items-center text-ink-soft hover:bg-bg-2 hover:text-burgundy transition-colors"
                        title="عرض"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/articles/${item.id}`}
                        className="w-7 h-7 rounded-lg grid place-items-center text-ink-soft hover:bg-bg-2 hover:text-burgundy transition-colors"
                        title="تعديل"
                      >
                        <Edit3 size={14} />
                      </Link>
                      <button
                        className="w-7 h-7 rounded-lg grid place-items-center text-ink-soft hover:bg-rose-cream hover:text-burgundy transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FilterChip({
  label,
  count,
  active,
  burgundy,
}: {
  label: string;
  count: number;
  active?: boolean;
  burgundy?: boolean;
}) {
  return (
    <button
      className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
        active
          ? "bg-ink text-white"
          : burgundy
            ? "bg-rose-cream text-burgundy hover:bg-rose-soft"
            : "bg-bg-2 text-ink-2 hover:bg-line"
      }`}
    >
      {label}
      <span className="mr-2 opacity-70 text-[11px]">{count}</span>
    </button>
  );
}

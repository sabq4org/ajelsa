"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ArrowRight, Save, Eye, Calendar, Image as ImageIcon, Zap, Loader2 } from "lucide-react";
import { toast } from "@/components/admin/Toast";
import { SeoSection } from "@/components/admin/SeoSection";
import { ArticlePreviewModal } from "@/components/admin/ArticlePreviewModal";
import { SmartEditBar } from "@/components/admin/SmartEditBar";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [contentJson, setContentJson] = useState<any>(null);
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("regular");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "";

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.items ?? []);
        if (d.items?.[0]) setCategoryId(d.items[0].id);
      })
      .catch(() => toast.error("فشل تحميل الأقسام"))
      .finally(() => setLoadingCats(false));
  }, []);

  async function handleSave(status: "draft" | "review" | "published" | "scheduled") {
    if (!title.trim() || title.trim().length < 5) {
      toast.error("العنوان مطلوب (5 أحرف على الأقل)");
      return;
    }
    if (!categoryId) {
      toast.error("اختر قسمًا للخبر");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          contentHtml,
          contentJson,
          categoryId,
          type,
          status,
          isBreaking,
          isFeatured,
          featuredImageUrl: featuredImageUrl || undefined,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          metaKeywords: metaKeywords.trim() || undefined,
          ogImageUrl: ogImageUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("فشل الحفظ: " + (err.error || "خطأ غير معروف"));
        setSaving(false);
        return;
      }

      toast.success(
        status === "published" ? "تم نشر الخبر" :
        status === "review" ? "تم إرساله للمراجعة" :
        status === "scheduled" ? "تم جدولة الخبر" : "تم حفظ المسودة"
      );
      router.push("/admin/articles");
    } catch (e: any) {
      toast.error("خطأ: " + e.message);
      setSaving(false);
    }
  }

  async function handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { media } = await res.json();
        setFeaturedImageUrl(media.url);
      }
    };
    input.click();
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center hover:bg-bg-2 transition-colors"
          >
            <ArrowRight size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink -tracking-[0.01em]">خبر جديد</h1>
            <p className="text-sm text-ink-soft">اكتب خبرك وانشره أو احفظه كمسودة</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="bg-paper border border-line px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-bg-2 transition-colors"
          >
            <Eye size={14} /> معاينة
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="bg-paper border border-line px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-bg-2 transition-colors disabled:opacity-50"
          >
            <Save size={14} /> حفظ كمسودة
          </button>
          <button
            onClick={() => handleSave("review")}
            disabled={saving}
            className="bg-paper border border-line px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-bg-2 transition-colors disabled:opacity-50"
          >
            إرسال للمراجعة
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="bg-burgundy text-white px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "نشر الآن"}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Main column */}
        <div className="space-y-5">
          {/* Title */}
          <div className="card">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="العنوان الرئيسي للخبر..."
              className="w-full text-3xl font-extrabold text-ink outline-none bg-transparent placeholder:text-ink-faint -tracking-[0.02em] leading-tight mb-3"
              dir="rtl"
            />
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="عنوان فرعي (اختياري)..."
              className="w-full text-base text-ink-2 outline-none bg-transparent placeholder:text-ink-faint"
              dir="rtl"
            />
          </div>

          {/* Excerpt */}
          <div className="card">
            <label className="block text-[11px] font-semibold text-ink-soft tracking-wide mb-2">
              المقتطف
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="مقدمة تظهر في الصفحة الرئيسية ووسائل التواصل..."
              rows={2}
              className="w-full text-sm text-ink outline-none bg-transparent resize-none leading-relaxed"
              dir="rtl"
            />
          </div>

          {/* Content editor */}
          <ArticleEditor
            placeholder="ابدأ كتابة محتوى الخبر..."
            onChange={({ html, json }) => {
              setContentHtml(html);
              setContentJson(json);
            }}
          />

          {/* ✨ Smart Edit Bar */}
          <SmartEditBar
            contentHtml={contentHtml}
            onApply={(data) => {
              if (data.title !== undefined) setTitle(data.title);
              if (data.subtitle !== undefined) setSubtitle(data.subtitle);
              if (data.excerpt !== undefined) setExcerpt(data.excerpt);
              if (data.metaTitle !== undefined) setMetaTitle(data.metaTitle);
              if (data.metaDescription !== undefined) setMetaDescription(data.metaDescription);
              if (data.metaKeywords !== undefined) setMetaKeywords(data.metaKeywords);
              if (data.contentHtml !== undefined) {
                setContentHtml(data.contentHtml);
              }
            }}
          />

          {/* SEO Section */}
          <SeoSection
            articleTitle={title}
            metaTitle={metaTitle}
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            metaKeywords={metaKeywords}
            setMetaKeywords={setMetaKeywords}
            ogImageUrl={ogImageUrl}
            setOgImageUrl={setOgImageUrl}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Featured image */}
          <div className="card">
            <h3 className="text-[14px] font-bold text-ink mb-3">الصورة الرئيسية</h3>
            {featuredImageUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-2">
                <img
                  src={featuredImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setFeaturedImageUrl("")}
                  className="absolute top-2 left-2 bg-paper text-ink-2 px-3 py-1 rounded-md text-xs font-semibold"
                >
                  إزالة
                </button>
              </div>
            ) : (
              <button
                onClick={handleImageUpload}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-line bg-bg-2 hover:border-burgundy hover:bg-rose-cream/30 transition-all grid place-items-center text-ink-soft"
              >
                <div className="text-center">
                  <ImageIcon size={28} className="mx-auto mb-2 opacity-60" />
                  <span className="text-xs">اضغط لرفع الصورة</span>
                </div>
              </button>
            )}
          </div>

          {/* Category */}
          <div className="card">
            <h3 className="text-[14px] font-bold text-ink mb-3">القسم</h3>
            {loadingCats ? (
              <div className="py-3 grid place-items-center text-ink-soft"><Loader2 size={14} className="animate-spin" /></div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input"
                dir="rtl"
              >
                <option value="">اختر القسم...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type & flags */}
          <div className="card space-y-4">
            <div>
              <h3 className="text-[14px] font-bold text-ink mb-3">نوع الخبر</h3>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input"
              >
                <option value="regular">عادي</option>
                <option value="breaking">عاجل</option>
                <option value="exclusive">حصري</option>
                <option value="investigation">تحقيق</option>
                <option value="opinion">رأي</option>
                <option value="video">فيديو</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 bg-bg-2 rounded-xl cursor-pointer hover:bg-rose-cream/40 transition-colors">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 accent-burgundy"
              />
              <Zap size={14} className="text-burgundy" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-ink">عاجل</div>
                <div className="text-[11px] text-ink-soft">يظهر في شريط الأخبار</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-bg-2 rounded-xl cursor-pointer hover:bg-rose-cream/40 transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-burgundy"
              />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-ink">مميز</div>
                <div className="text-[11px] text-ink-soft">يظهر في الصفحة الرئيسية</div>
              </div>
            </label>
          </div>

          {/* Schedule */}
          <div className="card">
            <h3 className="text-[14px] font-bold text-ink mb-3 flex items-center gap-2">
              <Calendar size={14} />
              جدولة النشر
            </h3>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input"
            />
            {scheduledAt && (
              <button
                onClick={() => handleSave("scheduled")}
                disabled={saving}
                className="w-full mt-3 bg-bg-2 hover:bg-line text-ink-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors"
              >
                جدولة للوقت المحدد
              </button>
            )}
            <p className="text-[11px] text-ink-soft mt-2">
              اختياري — اترك فارغاً للنشر الفوري
            </p>
          </div>
        </div>
      </div>

      {/* Article Preview Modal */}
      <ArticlePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        subtitle={subtitle}
        contentHtml={contentHtml}
        featuredImageUrl={featuredImageUrl}
        isBreaking={isBreaking}
        categoryName={categoryName}
      />
    </>
  );
}

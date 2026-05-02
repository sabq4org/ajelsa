"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ArrowRight, Save, Eye, Calendar, Image as ImageIcon, Zap, Loader2, Trash2, History } from "lucide-react";
import { toast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/Modal";
import { SeoSection } from "@/components/admin/SeoSection";
import { SmartEditBar } from "@/components/admin/SmartEditBar";
import { ArticlePreviewModal } from "@/components/admin/ArticlePreviewModal";
import { VersionHistoryPanel } from "@/components/admin/VersionHistoryPanel";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [contentJson, setContentJson] = useState<any>(null);
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("regular");
  const [status, setStatus] = useState<string>("draft");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [initialContent, setInitialContent] = useState<any>(null);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // Version history panel
  const [historyOpen, setHistoryOpen] = useState(false);

  const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "";

  useEffect(() => {
    void Promise.all([
      fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.items ?? [])),
      fetch(`/api/articles/${id}`).then((r) => r.json()).then((d) => {
        const a = d.article;
        if (!a) {
          toast.error("الخبر غير موجود");
          router.push("/admin/articles");
          return;
        }
        setTitle(a.title || "");
        setSubtitle(a.subtitle || "");
        setExcerpt(a.excerpt || "");
        setContentHtml(a.contentHtml || "");
        setContentJson(a.contentJson);
        setInitialContent(a.contentJson || a.contentHtml || "");
        setCategoryId(a.categoryId || "");
        setType(a.type || "regular");
        setStatus(a.status || "draft");
        setIsBreaking(!!a.isBreaking);
        setIsFeatured(!!a.isFeatured);
        setFeaturedImageUrl(a.featuredImageUrl || "");
        setMetaTitle(a.metaTitle || "");
        setMetaDescription(a.metaDescription || "");
        setMetaKeywords(a.metaKeywords || "");
        setOgImageUrl(a.ogImageUrl || "");
        if (a.scheduledAt) {
          const d2 = new Date(a.scheduledAt);
          setScheduledAt(d2.toISOString().slice(0, 16));
        }
      }),
    ])
      .catch(() => toast.error("خطأ في التحميل"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSave(newStatus?: string) {
    if (!title.trim() || title.trim().length < 5) {
      toast.error("العنوان مطلوب (5 أحرف على الأقل)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          contentHtml,
          contentJson,
          categoryId,
          type,
          status: newStatus ?? status,
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
        toast.error("فشل الحفظ: " + (err.error || "خطأ"));
        return;
      }
      const d = await res.json();
      setStatus(d.article.status);
      toast.success("تم حفظ التعديلات");
    } catch (e: any) {
      toast.error("خطأ: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "فشل الحذف");
      toast.success("تم حذف الخبر");
      router.push("/admin/articles");
    } catch (e: any) {
      toast.error(e.message);
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
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("فشل الرفع");
        const { media } = await res.json();
        setFeaturedImageUrl(media.url);
        toast.success("تم رفع الصورة");
      } catch (e: any) {
        toast.error(e.message);
      }
    };
    input.click();
  }

  function handleRestore(restoredTitle: string, restoredContentJson: any) {
    setTitle(restoredTitle);
    if (restoredContentJson) {
      setContentJson(restoredContentJson);
      setInitialContent(restoredContentJson);
    }
    toast.success("تم استعادة النسخة — لا تنسَ الحفظ");
  }

  if (loading) {
    return (
      <div className="py-20 grid place-items-center text-ink-soft">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="w-10 h-10 rounded-xl border border-line bg-paper grid place-items-center hover:bg-bg-2 transition-colors">
            <ArrowRight size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink -tracking-[0.01em]">تعديل خبر</h1>
            <p className="text-sm text-ink-soft">
              الحالة الحالية: <span className="font-semibold text-ink">{statusLabel(status)}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="bg-paper border border-line px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-bg-2 transition-colors"
          >
            <History size={14} /> السجل
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            className="bg-paper border border-line px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-bg-2 transition-colors"
          >
            <Eye size={14} /> معاينة
          </button>
          <button onClick={() => setConfirmDelete(true)} className="bg-paper border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-rose-50 transition-colors">
            <Trash2 size={14} /> حذف
          </button>
          <button onClick={() => handleSave("draft")} disabled={saving} className="bg-paper border border-line px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-bg-2 transition-colors disabled:opacity-50">
            <Save size={14} /> حفظ كمسودة
          </button>
          {status !== "published" ? (
            <button onClick={() => handleSave("published")} disabled={saving} className="bg-burgundy text-white px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {saving ? "جاري..." : "نشر الآن"}
            </button>
          ) : (
            <button onClick={() => handleSave()} disabled={saving} className="bg-burgundy text-white px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {saving ? "جاري..." : "حفظ التعديلات"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="card">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان الرئيسي للخبر..." className="w-full text-3xl font-extrabold text-ink outline-none bg-transparent placeholder:text-ink-faint -tracking-[0.02em] leading-tight mb-3" dir="rtl" />
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="عنوان فرعي (اختياري)..." className="w-full text-base text-ink-2 outline-none bg-transparent placeholder:text-ink-faint" dir="rtl" />
          </div>

          <div className="card">
            <label className="block text-[11px] font-semibold text-ink-soft tracking-wide mb-2">المقتطف</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="مقدمة..." rows={2} className="w-full text-sm text-ink outline-none bg-transparent resize-none leading-relaxed" dir="rtl" />
          </div>

          <ArticleEditor
            placeholder="ابدأ كتابة محتوى الخبر..."
            initialContent={initialContent}
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
              if (data.contentHtml !== undefined) setContentHtml(data.contentHtml);
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

        <div className="space-y-5">
          <div className="card">
            <h3 className="text-[14px] font-bold text-ink mb-3">الصورة الرئيسية</h3>
            {featuredImageUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImageUrl} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setFeaturedImageUrl("")} className="absolute top-2 left-2 bg-paper text-ink-2 px-3 py-1 rounded-md text-xs font-semibold">إزالة</button>
              </div>
            ) : (
              <button onClick={handleImageUpload} className="w-full aspect-video rounded-xl border-2 border-dashed border-line bg-bg-2 hover:border-burgundy hover:bg-rose-cream/30 transition-all grid place-items-center text-ink-soft">
                <div className="text-center">
                  <ImageIcon size={28} className="mx-auto mb-2 opacity-60" />
                  <span className="text-xs">اضغط لرفع الصورة</span>
                </div>
              </button>
            )}
          </div>

          <div className="card">
            <h3 className="text-[14px] font-bold text-ink mb-3">القسم</h3>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input" dir="rtl">
              <option value="">اختر القسم...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="card space-y-4">
            <div>
              <h3 className="text-[14px] font-bold text-ink mb-3">نوع الخبر</h3>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input">
                <option value="regular">عادي</option>
                <option value="breaking">عاجل</option>
                <option value="exclusive">حصري</option>
                <option value="investigation">تحقيق</option>
                <option value="opinion">رأي</option>
                <option value="video">فيديو</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 bg-bg-2 rounded-xl cursor-pointer hover:bg-rose-cream/40 transition-colors">
              <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="w-4 h-4 accent-burgundy" />
              <Zap size={14} className="text-burgundy" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-ink">عاجل</div>
                <div className="text-[11px] text-ink-soft">يظهر في شريط الأخبار</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-bg-2 rounded-xl cursor-pointer hover:bg-rose-cream/40 transition-colors">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-burgundy" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-ink">مميز</div>
                <div className="text-[11px] text-ink-soft">يظهر في الصفحة الرئيسية</div>
              </div>
            </label>
          </div>

          <div className="card">
            <h3 className="text-[14px] font-bold text-ink mb-3 flex items-center gap-2">
              <Calendar size={14} /> جدولة النشر
            </h3>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="input" />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف الخبر"
        message={`هل أنت متأكد من حذف "${title}"؟ لا يمكن التراجع عن هذه العملية.`}
        confirmText="حذف نهائي"
        danger
      />

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

      {/* Version History Panel */}
      <VersionHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        articleId={id}
        onRestore={handleRestore}
      />
    </>
  );
}

function statusLabel(s: string) {
  return ({ draft: "مسودة", review: "قيد المراجعة", scheduled: "مجدول", published: "منشور", archived: "مؤرشف" } as Record<string, string>)[s] ?? s;
}

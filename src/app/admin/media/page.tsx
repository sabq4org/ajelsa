"use client";

import { AdminTopbar } from "@/components/admin/AdminLayout";
import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Loader2, Image as ImageIcon, Copy } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/Modal";
import { toast } from "@/components/admin/Toast";

type Media = {
  id: string;
  filename: string;
  originalFilename: string | null;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  altText: string | null;
  createdAt: string;
  uploaderName: string | null;
};

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Media | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const d = await res.json();
      setItems(d.items ?? []);
    } catch {
      toast.error("فشل التحميل");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let okCount = 0, failCount = 0;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) okCount++;
        else failCount++;
      } catch { failCount++; }
    }
    setUploading(false);
    if (okCount) toast.success(`تم رفع ${okCount} ملف`);
    if (failCount) toast.error(`فشل ${failCount} ملف`);
    void load();
  }

  async function handleDelete(m: Media) {
    try {
      const res = await fetch(`/api/media/${m.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("تم الحذف");
      setItems((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      toast.success("تم نسخ الرابط");
    } catch {}
  }

  return (
    <>
      <AdminTopbar
        title="المكتبة"
        subtitle={`${items.length} ملف · إدارة الصور والوسائط`}
        actions={
          <>
            <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="hidden" />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-burgundy text-white px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark transition-all disabled:opacity-50">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? "جاري الرفع..." : "رفع ملف"}
            </button>
          </>
        }
      />

      {loading ? (
        <div className="card py-16 grid place-items-center text-ink-soft"><Loader2 className="animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card py-16 text-center text-ink-soft text-sm flex flex-col items-center gap-3">
          <ImageIcon size={32} className="opacity-40" />
          <div>المكتبة فارغة. ارفع أول صورة.</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((m) => (
            <div key={m.id} className="group card overflow-hidden p-0 relative aspect-square">
              {m.mimeType?.startsWith("image/") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={m.url} alt={m.altText ?? ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center bg-bg-2 text-ink-soft text-xs">{m.mimeType}</div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(m.url)} className="bg-white/90 text-ink p-1.5 rounded-lg hover:bg-white" title="نسخ الرابط">
                  <Copy size={12} />
                </button>
                <button onClick={() => setConfirmDelete(m)} className="bg-rose-600 text-white p-1.5 rounded-lg hover:bg-rose-700" title="حذف">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => { if (confirmDelete) await handleDelete(confirmDelete); }}
        title="حذف الملف"
        message="حذف الملف نهائياً؟ سيتم إزالة الصورة من جميع الأخبار التي تستخدمها."
        confirmText="حذف"
        danger
      />
    </>
  );
}

"use client";

import { AdminTopbar } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Megaphone, Edit3, X } from "lucide-react";
import { toast } from "@/components/admin/Toast";

type Ad = {
  id: string; title: string; position: string; imageUrl?: string | null;
  linkUrl?: string | null; advertiser?: string | null; isActive: boolean;
  impressions: number; clicks: number; startDate?: string | null; endDate?: string | null;
};

const POS_LABELS: Record<string, string> = {
  header_banner: "بانر الرأسية", sidebar_top: "جانبي علوي", sidebar_bottom: "جانبي سفلي",
  article_top: "أعلى المقال", article_middle: "وسط المقال",
  article_bottom: "أسفل المقال", footer_banner: "بانر التذييل",
};

const POSITIONS = Object.entries(POS_LABELS);

const EMPTY_FORM = { title: "", position: "header_banner", imageUrl: "", linkUrl: "", advertiser: "", startDate: "", endDate: "" };

export default function AdsPage() {
  const [items, setItems] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/ads");
    const data = await res.json();
    setItems(data.ads ?? []);
    setLoading(false);
  }

  async function toggleActive(ad: Ad) {
    await fetch(`/api/ads/${ad.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    setItems(prev => prev.map(a => a.id === ad.id ? { ...a, isActive: !a.isActive } : a));
  }

  async function deleteAd(id: string) {
    if (!confirm("حذف الإعلان؟")) return;
    await fetch(`/api/ads/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(a => a.id !== id));
    toast.success("تم الحذف");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isActive: true }),
      });
      const data = await res.json();
      setItems(prev => [data.ad, ...prev]);
      setModal(false); setForm(EMPTY_FORM);
      toast.success("تم إضافة الإعلان");
    } catch { toast.error("فشل الحفظ"); }
    setSaving(false);
  }

  const totalImpressions = items.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = items.reduce((s, a) => s + a.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const activeCount = items.filter(a => a.isActive).length;

  return (
    <>
      <AdminTopbar
        title="إدارة الإعلانات"
        subtitle={`${items.length} إعلان · ${activeCount} نشط`}
        actions={
          <button onClick={() => setModal(true)}
            className="bg-burgundy text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all">
            <Plus size={14} /> إعلان جديد
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إعلانات نشطة", value: activeCount, sub: `من ${items.length} إجمالي` },
          { label: "الظهورات", value: totalImpressions.toLocaleString("ar"), sub: "إجمالي" },
          { label: "النقرات", value: totalClicks.toLocaleString("ar"), sub: "إجمالي" },
          { label: "معدل النقر", value: `${avgCTR}%`, sub: "CTR متوسط" },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <div className="text-[24px] font-bold text-ink">{s.value}</div>
            <div className="text-[12px] font-semibold text-ink mt-1">{s.label}</div>
            <div className="text-[11px] text-ink-faint">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="py-16 text-center text-ink-soft text-sm">جارٍ التحميل...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone className="mx-auto mb-3 text-ink-faint" size={36} />
            <p className="text-ink-soft text-sm">لا توجد إعلانات بعد</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-bg-2">
                {["الإعلان","الموضع","المعلن","الظهورات","النقرات","CTR","الحالة",""].map(h => (
                  <th key={h} className="text-right px-4 py-3 text-[11px] font-semibold text-ink-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(ad => {
                const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={ad.id} className="border-b border-line-soft last:border-b-0 hover:bg-bg-2/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-ink">{ad.title}</div>
                      {ad.linkUrl && <div className="text-[11px] text-ink-faint truncate max-w-[160px]">{ad.linkUrl}</div>}
                    </td>
                    <td className="px-4 py-3"><span className="text-[12px] bg-bg-2 px-2 py-1 rounded-lg text-ink-soft">{POS_LABELS[ad.position] ?? ad.position}</span></td>
                    <td className="px-4 py-3 text-[12px] text-ink-soft">{ad.advertiser ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold tabular-nums">{ad.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold tabular-nums">{ad.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-burgundy tabular-nums">{ctr}%</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(ad)} className="flex items-center gap-1.5 text-[12px]">
                        {ad.isActive
                          ? <><ToggleRight size={20} className="text-emerald-600" /><span className="text-emerald-700">نشط</span></>
                          : <><ToggleLeft size={20} className="text-ink-faint" /><span className="text-ink-soft">متوقف</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteAd(ad.id)} className="w-7 h-7 grid place-items-center rounded-lg text-ink-soft hover:bg-rose-cream hover:text-burgundy transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-paper rounded-2xl shadow-card w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h2 className="text-[15px] font-bold text-ink">إعلان جديد</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 grid place-items-center rounded-xl hover:bg-bg-2 text-ink-soft"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-1 block">عنوان الإعلان *</label>
                <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="input w-full" placeholder="مثال: إعلان شركة STC" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-1 block">الموضع *</label>
                <select required value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))} className="input w-full">
                  {POSITIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-1 block">المعلن</label>
                <input value={form.advertiser} onChange={e => setForm(f => ({...f, advertiser: e.target.value}))}
                  className="input w-full" placeholder="اسم الشركة أو الجهة" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-1 block">رابط الإعلان</label>
                <input value={form.linkUrl} onChange={e => setForm(f => ({...f, linkUrl: e.target.value}))}
                  className="input w-full" placeholder="https://..." />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-1 block">رابط الصورة</label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({...f, imageUrl: e.target.value}))}
                  className="input w-full" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-ink-soft mb-1 block">تاريخ البداية</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} className="input w-full" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-ink-soft mb-1 block">تاريخ الانتهاء</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} className="input w-full" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-burgundy text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-burgundy-dark transition-all disabled:opacity-60">
                  {saving ? "جارٍ الحفظ..." : "إضافة الإعلان"}
                </button>
                <button type="button" onClick={() => setModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-line text-ink-soft text-[13px] hover:bg-bg-2 transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

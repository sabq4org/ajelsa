"use client";

import { AdminTopbar } from "@/components/admin/AdminLayout";
import { useEffect, useMemo, useState } from "react";
import { Mail, Download, Search, Send } from "lucide-react";

type Subscriber = {
  id: string; email: string; name: string | null; isActive: boolean;
  source: string | null; subscribedAt: string; unsubscribedAt: string | null;
};

export default function NewsletterPage() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/newsletter/subscribers").then(r => r.json()).then(d => {
      setSubs(d.subscribers ?? []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    subs.filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())),
    [subs, search]);

  const activeCount = subs.filter(s => s.isActive).length;
  const thisMonth = subs.filter(s => {
    const d = new Date(s.subscribedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  function exportCSV() {
    const rows = [["البريد", "الاسم", "المصدر", "تاريخ الاشتراك", "الحالة"]];
    subs.forEach(s => rows.push([s.email, s.name ?? "", s.source ?? "", new Date(s.subscribedAt).toLocaleDateString("ar-SA"), s.isActive ? "نشط" : "ملغي"]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <AdminTopbar title="النشرة البريدية" subtitle={`${activeCount} مشترك نشط`}
        actions={
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line text-ink-2 text-[13px] font-semibold hover:bg-bg-2 transition-all">
              <Download size={14} /> تصدير CSV
            </button>
            <button className="flex items-center gap-2 bg-bg-2 text-ink-soft px-4 py-2.5 rounded-xl text-[13px] font-semibold cursor-not-allowed" title="قريباً">
              <Send size={14} /> إرسال النشرة
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "إجمالي المشتركين", value: subs.length },
          { label: "مشتركون نشطون", value: activeCount },
          { label: "اشتركوا هذا الشهر", value: thisMonth },
        ].map((s, i) => (
          <div key={i} className="card text-center py-5">
            <div className="text-[26px] font-bold text-ink">{s.value.toLocaleString("ar")}</div>
            <div className="text-[12px] text-ink-soft mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Coming soon note */}
      <div className="card mb-5 flex items-center gap-3 bg-amber-50 border-amber-200 py-3 px-5">
        <Send size={16} className="text-amber-600 flex-shrink-0" />
        <p className="text-[13px] text-amber-800">
          <span className="font-bold">إرسال النشرة — قريباً:</span> التكامل مع SendGrid أو Mailchimp لإرسال النشرات البريدية سيكون متاحاً قريباً.
        </p>
      </div>

      {/* Search */}
      <div className="card mb-4 p-3">
        <div className="flex items-center gap-2 bg-bg border border-line rounded-xl px-3 py-2">
          <Search size={14} className="text-ink-soft" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالبريد أو الاسم..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="py-16 text-center text-ink-soft text-sm">جارٍ التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Mail className="mx-auto mb-3 text-ink-faint" size={36} />
            <p className="text-ink-soft text-sm">{subs.length === 0 ? "لا يوجد مشتركون بعد" : "لا توجد نتائج"}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-bg-2">
                {["البريد الإلكتروني","الاسم","المصدر","تاريخ الاشتراك","الحالة"].map(h => (
                  <th key={h} className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-line-soft last:border-b-0 hover:bg-bg-2/40 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-ink">{s.email}</td>
                  <td className="px-5 py-3 text-[12px] text-ink-soft">{s.name ?? "—"}</td>
                  <td className="px-5 py-3"><span className="text-[11px] bg-bg-2 px-2 py-0.5 rounded-full text-ink-soft">{s.source ?? "مباشر"}</span></td>
                  <td className="px-5 py-3 text-[12px] text-ink-faint">{new Date(s.subscribedAt).toLocaleDateString("ar-SA")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-cream text-burgundy"}`}>
                      {s.isActive ? "نشط" : "ملغي"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

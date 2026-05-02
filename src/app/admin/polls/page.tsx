"use client";

import { AdminTopbar } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Plus, BarChart2, X, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import { toast } from "@/components/admin/Toast";

type PollOption = { id: string; text: string; votes: number; position: number };
type Poll = { id: string; question: string; isActive: boolean; endsAt: string | null; createdAt: string; options: PollOption[] };

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const r = await fetch("/api/polls");
    const d = await r.json();
    setPolls(d.polls ?? []); setLoading(false);
  }

  async function createPoll(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: options.filter(Boolean), endsAt: endsAt || null }),
      });
      const d = await res.json();
      setPolls(p => [d.poll, ...p]);
      setModal(false); setQuestion(""); setOptions(["", ""]); setEndsAt("");
      toast.success("تم إنشاء الاستطلاع");
    } catch { toast.error("فشل الحفظ"); }
    setSaving(false);
  }

  async function toggleActive(poll: Poll) {
    await fetch(`/api/polls/${poll.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !poll.isActive }),
    });
    setPolls(p => p.map(x => x.id === poll.id ? { ...x, isActive: !x.isActive } : x));
  }

  const addOption = () => options.length < 6 && setOptions(o => [...o, ""]);
  const removeOption = (i: number) => options.length > 2 && setOptions(o => o.filter((_, j) => j !== i));
  const setOption = (i: number, v: string) => setOptions(o => o.map((x, j) => j === i ? v : x));

  return (
    <>
      <AdminTopbar title="استطلاعات الرأي" subtitle={`${polls.length} استطلاع`}
        actions={
          <button onClick={() => setModal(true)}
            className="bg-burgundy text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark hover:-translate-y-0.5 transition-all">
            <Plus size={14} /> استطلاع جديد
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-bg-2" />)}
        </div>
      ) : polls.length === 0 ? (
        <div className="card py-20 text-center">
          <BarChart2 className="mx-auto mb-3 text-ink-faint" size={40} />
          <p className="text-ink-soft text-sm font-medium">لا توجد استطلاعات بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {polls.map(poll => {
            const total = poll.options.reduce((s, o) => s + o.votes, 0);
            return (
              <div key={poll.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-[14px] font-bold text-ink leading-snug flex-1">{poll.question}</h3>
                  <button onClick={() => toggleActive(poll)}>
                    {poll.isActive
                      ? <ToggleRight size={22} className="text-emerald-600 flex-shrink-0" />
                      : <ToggleLeft size={22} className="text-ink-faint flex-shrink-0" />}
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 mb-4">
                  {poll.options.map(opt => {
                    const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                    return (
                      <div key={opt.id}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="text-ink font-medium">{opt.text}</span>
                          <span className="text-ink-soft tabular-nums">{opt.votes} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-bg-2 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-l from-burgundy-soft to-burgundy rounded-full transition-all"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-faint border-t border-line pt-3">
                  <span>{total.toLocaleString("ar")} صوت</span>
                  <span className={`px-2 py-0.5 rounded-full ${poll.isActive ? "bg-emerald-50 text-emerald-700" : "bg-bg-2 text-ink-soft"}`}>
                    {poll.isActive ? "نشط" : "متوقف"}
                  </span>
                  {poll.endsAt && <span>ينتهي {new Date(poll.endsAt).toLocaleDateString("ar-SA")}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-paper rounded-2xl shadow-card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-paper">
              <h2 className="text-[15px] font-bold text-ink">استطلاع جديد</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 grid place-items-center rounded-xl hover:bg-bg-2 text-ink-soft"><X size={16}/></button>
            </div>
            <form onSubmit={createPoll} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-1 block">السؤال *</label>
                <textarea required value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                  className="input w-full resize-none" placeholder="اكتب سؤال الاستطلاع..." />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-2 block">الخيارات (2–6)</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input required value={opt} onChange={e => setOption(i, e.target.value)}
                      className="input flex-1" placeholder={`الخيار ${i + 1}`} />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)}
                        className="w-9 h-9 grid place-items-center rounded-xl border border-line text-ink-soft hover:bg-rose-cream hover:text-burgundy transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button type="button" onClick={addOption}
                    className="text-[12px] text-burgundy font-semibold flex items-center gap-1 hover:underline">
                    <Plus size={12} /> إضافة خيار
                  </button>
                )}
              </div>
              <div>
                <label className="text-[12px] font-semibold text-ink-soft mb-1 block">تاريخ الانتهاء (اختياري)</label>
                <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className="input w-full" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-burgundy text-white py-2.5 rounded-xl text-[13px] font-semibold hover:bg-burgundy-dark transition-all disabled:opacity-60">
                  {saving ? "جارٍ الحفظ..." : "إنشاء الاستطلاع"}
                </button>
                <button type="button" onClick={() => setModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-line text-ink-soft text-[13px] hover:bg-bg-2 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

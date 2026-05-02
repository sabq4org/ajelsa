"use client";

import { AdminTopbar } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Loader2, Users as UsersIcon, Shield, CheckCircle2, XCircle } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/Modal";
import { toast } from "@/components/admin/Toast";
import { PERMISSIONS } from "@/lib/rbac";

type User = {
  id: string;
  email: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  twitterHandle: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "مدير عام",
  editor_in_chief: "رئيس تحرير",
  editor: "محرر",
  writer: "كاتب",
  contributor: "مساهم",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  editor_in_chief: "bg-burgundy/10 text-burgundy",
  editor: "bg-blue-100 text-blue-700",
  writer: "bg-emerald-100 text-emerald-700",
  contributor: "bg-bg-2 text-ink-soft",
};

const PERMISSIONS_LABELS: Record<string, string> = {
  publish: "النشر",
  delete: "الحذف",
  manage_users: "إدارة المستخدمين",
  manage_cats: "إدارة الأقسام",
  view_audit: "سجل النشاطات",
  manage_ads: "الإعلانات",
};

const ROLES_ORDER = [
  { key: "super_admin", label: "مدير عام" },
  { key: "editor_in_chief", label: "رئيس تحرير" },
  { key: "editor", label: "محرر" },
  { key: "writer", label: "كاتب" },
  { key: "contributor", label: "مساهم" },
];

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<User & { password: string }>>({});
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const d = await res.json();
      setItems(d.items ?? []);
    } catch {
      toast.error("فشل التحميل");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.fullName || !form.email) {
      toast.error("الاسم والبريد مطلوبان");
      return;
    }
    if (!form.id && (!form.password || form.password.length < 8)) {
      toast.error("كلمة المرور 8 أحرف على الأقل");
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const url = isEdit ? `/api/users/${form.id}` : "/api/users";
      const method = isEdit ? "PATCH" : "POST";
      const payload: any = {
        fullName: form.fullName,
        bio: form.bio || undefined,
        twitterHandle: form.twitterHandle || undefined,
        role: form.role || "writer",
        isActive: form.isActive ?? true,
      };
      if (!isEdit) {
        payload.email = form.email;
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "فشل");
        return;
      }
      toast.success(isEdit ? "تم التحديث" : "تم إنشاء المستخدم");
      setModalOpen(false);
      setForm({});
      void load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: User) {
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("تم الحذف");
      setItems((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <>
      <AdminTopbar
        title="المحررون"
        subtitle={`${items.length} مستخدم · فريق التحرير والإدارة`}
        actions={
          <button onClick={() => { setForm({ role: "writer", isActive: true }); setModalOpen(true); }} className="bg-burgundy text-white px-4.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-red hover:bg-burgundy-dark transition-all">
            <Plus size={14} /> مستخدم جديد
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === "users" ? "bg-burgundy text-white shadow-red" : "bg-paper border border-line text-ink-2 hover:bg-bg-2"
          }`}
        >
          <span className="flex items-center gap-1.5"><UsersIcon size={13} /> المستخدمون</span>
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === "permissions" ? "bg-burgundy text-white shadow-red" : "bg-paper border border-line text-ink-2 hover:bg-bg-2"
          }`}
        >
          <span className="flex items-center gap-1.5"><Shield size={13} /> الصلاحيات</span>
        </button>
      </div>

      {activeTab === "permissions" && (
        <div className="card overflow-hidden p-0">
          <div className="p-5 border-b border-line">
            <h2 className="text-[15px] font-bold text-ink flex items-center gap-2"><Shield size={16} className="text-burgundy" /> مصفوفة صلاحيات الأدوار</h2>
            <p className="text-[12px] text-ink-soft mt-1">توضح ما يستطيع كل دور فعله داخل النظام</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-2 border-b border-line">
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-40">الدور</th>
                  {Object.entries(PERMISSIONS_LABELS).map(([key, label]) => (
                    <th key={key} className="px-4 py-3 text-center text-[11px] font-semibold text-ink-soft tracking-wide">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES_ORDER.map((role) => (
                  <tr key={role.key} className="border-b border-line-soft last:border-b-0 hover:bg-bg-2/40">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[role.key] ?? "bg-bg-2"}`}>
                        <Shield size={10} /> {role.label}
                      </span>
                    </td>
                    {Object.keys(PERMISSIONS_LABELS).map((perm) => {
                      const allowed = (PERMISSIONS[perm as keyof typeof PERMISSIONS] as readonly string[]).includes(role.key);
                      return (
                        <td key={perm} className="px-4 py-3.5 text-center">
                          {allowed ? (
                            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle size={18} className="text-ink-soft/30 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="py-16 grid place-items-center text-ink-soft"><Loader2 className="animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-ink-soft text-sm flex flex-col items-center gap-3">
            <UsersIcon size={32} className="opacity-40" />
            <div>لا يوجد مستخدمون</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-bg-2">
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide">المستخدم</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide">البريد</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-32">الدور</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-24">الحالة</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-soft tracking-wide w-32">آخر دخول</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-line-soft last:border-b-0 hover:bg-bg-2/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-cream text-burgundy grid place-items-center font-bold text-sm shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[14px] text-ink font-medium">{u.fullName}</div>
                        {u.bio && <div className="text-[11px] text-ink-soft">{u.bio}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-2">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] ?? "bg-bg-2"}`}>
                      <Shield size={10} />
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${u.isActive ? "bg-emerald-50 text-sage" : "bg-bg-2 text-ink-soft"}`}>
                      {u.isActive ? "نشط" : "معطّل"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-ink-soft">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn") : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setForm({ ...u, password: "" }); setModalOpen(true); }} className="w-7 h-7 rounded-lg grid place-items-center text-ink-soft hover:bg-bg-2 hover:text-burgundy transition-colors" title="تعديل">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete(u)} className="w-7 h-7 rounded-lg grid place-items-center text-ink-soft hover:bg-rose-cream hover:text-burgundy transition-colors" title="حذف">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? "تعديل مستخدم" : "مستخدم جديد"}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-ink-soft mb-1.5">الاسم الكامل *</label>
            <input type="text" value={form.fullName ?? ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink-soft mb-1.5">البريد الإلكتروني *</label>
            <input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" disabled={!!form.id} />
            {form.id && <p className="text-[10px] text-ink-soft mt-1">البريد لا يمكن تغييره بعد الإنشاء</p>}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink-soft mb-1.5">{form.id ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور *"}</label>
            <input type="password" value={form.password ?? ""} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder={form.id ? "اتركها فارغة للحفاظ على الكلمة الحالية" : "8 أحرف على الأقل"} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink-soft mb-1.5">الدور</label>
            <select value={form.role ?? "writer"} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-ink-soft mb-1.5">السيرة (اختياري)</label>
            <textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input" rows={2} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-burgundy" />
            <span className="text-sm">المستخدم نشط</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-burgundy-dark disabled:opacity-50">{saving ? "..." : "حفظ"}</button>
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-ink-2 border border-line hover:bg-bg">إلغاء</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => { if (confirmDelete) await handleDelete(confirmDelete); }}
        title="حذف المستخدم"
        message={`حذف المستخدم "${confirmDelete?.fullName}"؟ سيتم فقدان كل بياناته.`}
        confirmText="حذف نهائي"
        danger
      />
    </>
  );
}

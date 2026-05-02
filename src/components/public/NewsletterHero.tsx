import { Mail, Send, CheckCircle2 } from "lucide-react";

export function NewsletterHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-burgundy via-burgundy-dark to-burgundy text-white shadow-2xl">
      {/* Decorative shapes */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-yellow-400/10 blur-3xl" />

      {/* Pattern dots (decorative) */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center p-8 lg:p-14">
        {/* Right: Content */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-5">
            <Mail size={13} className="text-yellow-300" />
            <span className="text-[11px] font-bold tracking-widest uppercase">نشرة عاجل</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4 -tracking-[0.02em]">
            أهم الأخبار 
            <br />
            <span className="text-yellow-300">قبل غيرك</span>
          </h2>

          <p className="text-base lg:text-lg opacity-85 leading-relaxed mb-6 max-w-md">
            ملخص يومي بأهم الأحداث في صندوق بريدك كل صباح — مختار بعناية من رئيس التحرير.
          </p>

          <div className="flex flex-wrap gap-4 text-[13px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-yellow-300" />
              <span className="opacity-90">مجاني تماماً</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-yellow-300" />
              <span className="opacity-90">إلغاء في أي وقت</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-yellow-300" />
              <span className="opacity-90">بدون إزعاج</span>
            </div>
          </div>
        </div>

        {/* Left: Form */}
        <div className="relative">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Mail size={20} className="text-yellow-300" />
              اشترك الآن
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="الاسم"
                className="w-full px-4 py-3 rounded-xl bg-white/95 text-ink placeholder:text-ink-faint outline-none focus:ring-2 focus:ring-yellow-300/50 transition-all"
                dir="rtl"
              />
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="w-full px-4 py-3 rounded-xl bg-white/95 text-ink placeholder:text-ink-faint outline-none focus:ring-2 focus:ring-yellow-300/50 transition-all"
                dir="rtl"
              />
              <button className="w-full bg-yellow-300 hover:bg-yellow-400 text-burgundy py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg">
                <Send size={15} />
                اشترك مجاناً
              </button>
            </div>

            <p className="text-[10px] opacity-70 mt-4 text-center">
              + 12,000 مشترك ينضمون لنشرة عاجل
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

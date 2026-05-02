import { Mail, Send } from "lucide-react";

export function NewsletterHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-rose-cream/70 via-paper to-rose-cream/50 border border-burgundy/15 shadow-sm">
      {/* زخارف خفيفة */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-burgundy/[0.04] blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-burgundy/[0.04] blur-3xl" />

      <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center p-6 lg:p-7">
        {/* Right: Content */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-burgundy to-burgundy-dark grid place-items-center shadow-md flex-shrink-0">
            <Mail size={22} className="text-white" />
          </div>

          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-ink -tracking-[0.01em] mb-1">
              نشرة عاجل اليومية
            </h2>
            <p className="text-[13px] text-ink-soft leading-relaxed">
              ملخص أهم الأحداث في صندوق بريدك كل صباح
              <span className="hidden md:inline"> — مختار بعناية من رئيس التحرير.</span>
            </p>
          </div>
        </div>

        {/* Left: Form */}
        <form className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="email"
            placeholder="بريدك الإلكتروني"
            className="px-4 py-3 rounded-xl bg-paper border border-line text-ink placeholder:text-ink-faint outline-none focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/20 transition-all w-full md:w-72 text-sm"
            dir="rtl"
          />
          <button
            type="submit"
            className="bg-burgundy hover:bg-burgundy-dark text-white px-6 py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-md whitespace-nowrap"
          >
            <Send size={14} />
            اشترك مجاناً
          </button>
        </form>
      </div>
    </section>
  );
}

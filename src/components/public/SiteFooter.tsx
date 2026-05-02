import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Newspaper,
  Award,
  Users,
  Sparkles,
  Apple,
  PlayCircle,
  Heart,
  Quote,
} from "lucide-react";
import { getActiveCategories } from "@/lib/queries/articles";
import { FooterTickerBar } from "./FooterTickerBar";

const JOURNALISM_QUOTES = [
  { text: "الصحافة هي المسودة الأولى للتاريخ", author: "فيليب جراهام" },
  { text: "الكلمة الصادقة لا تموت", author: "حكمة عربية" },
  { text: "حرية الصحافة لا تقتصر على من يملكها", author: "أ. ج. ليبلينغ" },
  { text: "الأخبار شيء يريد أحدهم أن تخفيه", author: "لورد نورثكليف" },
  { text: "اكتب كأنك تتحدث، وستكون كاتباً جيداً", author: "إرنست همنغواي" },
];

const SOCIAL_LINKS = [
  { name: "تويتر",     icon: Twitter,   url: "https://twitter.com/ajelsa",   followers: "+850K", color: "hover:bg-sky-500" },
  { name: "فيسبوك",    icon: Facebook,  url: "#",                            followers: "+1.2M", color: "hover:bg-blue-600" },
  { name: "إنستغرام",  icon: Instagram, url: "#",                            followers: "+620K", color: "hover:bg-pink-500" },
  { name: "يوتيوب",    icon: Youtube,   url: "#",                            followers: "+340K", color: "hover:bg-red-600" },
  { name: "تيك توك",   icon: Send,      url: "#",                            followers: "+450K", color: "hover:bg-black" },
];

const TRUST_STATS = [
  { icon: Newspaper, value: "+50",  label: "خبر يومياً" },
  { icon: Users,     value: "+3M",  label: "قارئ" },
  { icon: Award,     value: "+20",  label: "سنة خبرة" },
];

export async function SiteFooter() {
  // اقتباس عشوائي
  const randomQuote = JOURNALISM_QUOTES[Math.floor(Math.random() * JOURNALISM_QUOTES.length)];

  let categories: any[] = [];
  try {
    categories = (await getActiveCategories()) as any[];
  } catch {}

  return (
    <>
      {/* ━━━━━━━━━━━━ شريط الأخبار العاجلة ━━━━━━━━━━━━ */}
      <FooterTickerBar />

      {/* ━━━━━━━━━━━━ الفوتر الرئيسي ━━━━━━━━━━━━ */}
      <footer className="relative bg-gradient-to-br from-burgundy-dark via-[#5a141d] to-ink text-white overflow-hidden">
        {/* زخارف ناعمة في الخلفية */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-burgundy/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-burgundy/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1320px] mx-auto px-8">

          {/* ━━━━━ Trust Bar (شريط الثقة في الأعلى) ━━━━━ */}
          <div className="grid grid-cols-3 gap-4 py-6 border-b border-white/10">
            {TRUST_STATS.map(({ icon: Icon, value, label }, i) => (
              <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm grid place-items-center text-yellow-300 flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-tight">{value}</div>
                  <div className="text-[11px] opacity-70">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ━━━━━ المحتوى الرئيسي للفوتر (4 أعمدة) ━━━━━ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 py-12">

            {/* العمود 1: الشعار + النبذة + الاجتماعية (4 أعمدة) */}
            <div className="lg:col-span-5">
              <div className="mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="صحيفة عاجل"
                  className="h-16 w-auto object-contain brightness-0 invert opacity-90"
                />
              </div>

              <p className="text-[14px] leading-loose opacity-85 mb-6 max-w-md">
                صحيفة إلكترونية سعودية تواكب نبض الحدث وتنقله بمصداقية وعمق.
                نلتزم بالكلمة الصادقة والصورة الحقيقية، ونؤمن أن الصحافة رسالة
                قبل أن تكون مهنة.
              </p>

              {/* الشبكات الاجتماعية */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                  تابعنا
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {SOCIAL_LINKS.map(({ name, icon: Icon, url, color }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={name}
                      className={`w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm grid place-items-center transition-all hover:scale-110 hover:-translate-y-0.5 ${color}`}
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* العمود 2: الأقسام (3 أعمدة) */}
            <div className="lg:col-span-3">
              <h3 className="text-[13px] font-extrabold tracking-widest uppercase mb-5 flex items-center gap-2 text-yellow-300">
                <Newspaper size={14} />
                الأقسام
              </h3>
              <ul className="space-y-2.5">
                {categories.slice(0, 8).map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-[13px] opacity-80 hover:opacity-100 hover:text-yellow-300 hover:translate-x-1 inline-block transition-all"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* العمود 3: عاجل (روابط) (2 عمود) */}
            <div className="lg:col-span-2">
              <h3 className="text-[13px] font-extrabold tracking-widest uppercase mb-5 flex items-center gap-2 text-yellow-300">
                <Sparkles size={14} />
                عاجل
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: "من نحن",            href: "/about" },
                  { label: "سياسة الخصوصية",   href: "/privacy" },
                  { label: "شروط الاستخدام",   href: "/terms" },
                  { label: "إعلن معنا",        href: "/advertise" },
                  { label: "انضم لفريقنا",     href: "/careers" },
                  { label: "الأرشيف",         href: "/archive" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] opacity-80 hover:opacity-100 hover:text-yellow-300 hover:translate-x-1 inline-block transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* العمود 4: تواصل (2 عمود) */}
            <div className="lg:col-span-2">
              <h3 className="text-[13px] font-extrabold tracking-widest uppercase mb-5 flex items-center gap-2 text-yellow-300">
                <Mail size={14} />
                تواصل
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-[13px] opacity-80">
                  <Mail size={13} className="mt-1 flex-shrink-0 text-yellow-300/70" />
                  <a href="mailto:info@ajel.sa" className="hover:text-yellow-300 transition-colors">
                    info@ajel.sa
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] opacity-80">
                  <Phone size={13} className="mt-1 flex-shrink-0 text-yellow-300/70" />
                  <span dir="ltr">+966 11 XXX XXXX</span>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] opacity-80">
                  <MapPin size={13} className="mt-1 flex-shrink-0 text-yellow-300/70" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </li>
                <li className="pt-2 mt-2 border-t border-white/10">
                  <a
                    href="mailto:editor@ajel.sa"
                    className="text-[12px] text-yellow-300 hover:text-yellow-200 font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    رسالة لرئيس التحرير
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ━━━━━ شريط تطبيقات الجوال ━━━━━ */}
          <div className="border-y border-white/10 py-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-bold mb-1">حمّل تطبيق عاجل</p>
              <p className="text-[11px] opacity-70">احصل على الأخبار في أي وقت ومكان</p>
            </div>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white hover:text-burgundy px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <Apple size={20} />
                <div className="text-right leading-tight">
                  <div className="text-[9px] opacity-70">حمّل من</div>
                  <div className="text-[12px] font-bold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white hover:text-burgundy px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <PlayCircle size={20} />
                <div className="text-right leading-tight">
                  <div className="text-[9px] opacity-70">حمّل من</div>
                  <div className="text-[12px] font-bold">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* ━━━━━ اقتباس صحفي ━━━━━ */}
          <div className="py-6 text-center relative">
            <Quote className="absolute top-4 right-1/2 translate-x-1/2 text-yellow-300/15" size={36} strokeWidth={1.5} />
            <p className="text-[14px] italic opacity-80 max-w-2xl mx-auto leading-relaxed">
              «{randomQuote.text}»
            </p>
            <p className="text-[10px] opacity-50 mt-2">— {randomQuote.author}</p>
          </div>

          {/* ━━━━━ الشريط السفلي ━━━━━ */}
          <div className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] opacity-70">
            <div>
              © 2026 صحيفة عاجل — جميع الحقوق محفوظة
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
              </span>
              <span className="font-medium">الموقع يعمل بشكل طبيعي</span>
            </div>
            <div className="flex items-center gap-1">
              <span>صنع بكل</span>
              <Heart size={12} className="text-rose-400 fill-rose-400 animate-pulse" />
              <span>في الرياض</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

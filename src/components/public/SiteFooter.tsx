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
  { name: "تويتر",     icon: Twitter,   url: "https://twitter.com/ajelsa", color: "hover:bg-sky-500" },
  { name: "فيسبوك",    icon: Facebook,  url: "#",                          color: "hover:bg-blue-600" },
  { name: "إنستغرام",  icon: Instagram, url: "#",                          color: "hover:bg-pink-500" },
  { name: "يوتيوب",    icon: Youtube,   url: "#",                          color: "hover:bg-red-600" },
  { name: "تيك توك",   icon: Send,      url: "#",                          color: "hover:bg-black" },
];

export async function SiteFooter() {
  const randomQuote = JOURNALISM_QUOTES[Math.floor(Math.random() * JOURNALISM_QUOTES.length)];

  let categories: any[] = [];
  try {
    categories = (await getActiveCategories()) as any[];
  } catch {}

  return (
    <>
      {/* شريط الأخبار العاجلة */}
      <FooterTickerBar />

      <footer className="relative bg-gradient-to-br from-burgundy-dark via-[#5a141d] to-ink text-white overflow-hidden">
        {/* زخارف خفيفة جداً */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-burgundy/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-burgundy/10 blur-3xl" />

        <div className="relative max-w-[1320px] mx-auto px-8">

          {/* الأعمدة الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 py-9">

            {/* العمود 1: الشعار + النبذة + الاجتماعية */}
            <div className="lg:col-span-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="صحيفة عاجل"
                className="h-12 w-auto object-contain brightness-0 invert opacity-90 mb-3"
              />

              <p className="text-[13px] leading-relaxed opacity-80 mb-4 max-w-md">
                صحيفة إلكترونية سعودية تواكب نبض الحدث وتنقله بمصداقية وعمق.
                نلتزم بالكلمة الصادقة، ونؤمن أن الصحافة رسالة قبل أن تكون مهنة.
              </p>

              {/* الشبكات الاجتماعية */}
              <div className="flex gap-2 flex-wrap">
                {SOCIAL_LINKS.map(({ name, icon: Icon, url, color }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className={`w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm grid place-items-center transition-all hover:scale-110 hover:-translate-y-0.5 ${color}`}
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* العمود 2: الأقسام */}
            <div className="lg:col-span-3">
              <h3 className="text-[12px] font-extrabold tracking-widest uppercase mb-4 text-rose-cream">
                الأقسام
              </h3>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-1 lg:gap-y-2">
                {categories.slice(0, 8).map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-[12px] opacity-80 hover:opacity-100 hover:text-rose-cream transition-all"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* العمود 3: عاجل */}
            <div className="lg:col-span-2">
              <h3 className="text-[12px] font-extrabold tracking-widest uppercase mb-4 text-rose-cream">
                عاجل
              </h3>
              <ul className="space-y-2">
                {[
                  { label: "من نحن",          href: "/about" },
                  { label: "سياسة الخصوصية", href: "/privacy" },
                  { label: "شروط الاستخدام", href: "/terms" },
                  { label: "إعلن معنا",      href: "/advertise" },
                  { label: "انضم لفريقنا",   href: "/careers" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] opacity-80 hover:opacity-100 hover:text-rose-cream transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* العمود 4: تواصل */}
            <div className="lg:col-span-2">
              <h3 className="text-[12px] font-extrabold tracking-widest uppercase mb-4 text-rose-cream">
                تواصل
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-[12px] opacity-80">
                  <Mail size={12} className="flex-shrink-0 text-rose-cream/70" />
                  <a href="mailto:info@ajel.sa" className="hover:text-rose-cream transition-colors">
                    info@ajel.sa
                  </a>
                </li>
                <li className="flex items-center gap-2 text-[12px] opacity-80">
                  <Phone size={12} className="flex-shrink-0 text-rose-cream/70" />
                  <span dir="ltr">+966 11 XXX XXXX</span>
                </li>
                <li className="flex items-center gap-2 text-[12px] opacity-80">
                  <MapPin size={12} className="flex-shrink-0 text-rose-cream/70" />
                  <span>الرياض</span>
                </li>
              </ul>
            </div>
          </div>

          {/* اقتباس صحفي مدمج (سطر واحد) */}
          <div className="border-t border-white/10 py-4 text-center">
            <p className="text-[12px] italic opacity-70 flex items-center justify-center gap-2 flex-wrap">
              <Quote size={12} className="text-rose-cream/60 flex-shrink-0" strokeWidth={1.5} />
              «{randomQuote.text}»
              <span className="opacity-60">— {randomQuote.author}</span>
            </p>
          </div>

          {/* الشريط السفلي */}
          <div className="border-t border-white/10 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] opacity-70">
            <div>© 2026 صحيفة عاجل — جميع الحقوق محفوظة</div>

            <div className="flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
              </span>
              <span className="font-medium">الموقع يعمل بشكل طبيعي</span>
            </div>

            <div className="flex items-center gap-1">
              <span>صنع بكل</span>
              <Heart size={11} className="text-rose-400 fill-rose-400 animate-pulse" />
              <span>في الرياض</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-faint pt-16 pb-6 mt-16 relative z-10">
      <div className="max-w-[1320px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
          <div>
            <div className="font-serif text-white text-[48px] leading-none font-bold">
              عاجل
            </div>
            <p className="mt-5 text-sm leading-loose max-w-[320px]">
              صحيفة إلكترونية سعودية تواكب نبض الحدث، وتنقله بمصداقية وعمق.
              نلتزم بالكلمة الصادقة والصورة الحقيقية، ونؤمن أن الصحافة رسالة
              قبل أن تكون مهنة.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[
                { l: "𝕏", t: "X" },
                { l: "⊙", t: "Instagram" },
                { l: "▶", t: "YouTube" },
                { l: "♪", t: "TikTok" },
                { l: "≋", t: "RSS" },
              ].map((s) => (
                <Link
                  key={s.t}
                  href="#"
                  title={s.t}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-sm transition-all hover:bg-burgundy hover:text-white hover:border-burgundy"
                >
                  {s.l}
                </Link>
              ))}
            </div>
          </div>

          <FooterCol
            title="الأقسام"
            links={[
              ["محليات", "/category/local"],
              ["اقتصاد", "/category/business"],
              ["رياضة", "/category/sports"],
              ["عالم", "/category/world"],
              ["تقنية", "/category/tech"],
              ["منوعات", "/category/lifestyle"],
            ]}
          />

          <FooterCol
            title="عاجل"
            links={[
              ["من نحن", "/about"],
              ["سياسة الخصوصية", "/privacy"],
              ["شروط الاستخدام", "/terms"],
              ["للإعلان معنا", "/advertise"],
              ["انضم إلينا", "/jobs"],
            ]}
          />

          <FooterCol
            title="تواصل"
            links={[
              ["info@ajel.sa", "mailto:info@ajel.sa"],
              ["+966 11 xxx xxxx", "tel:+966"],
              ["الرياض، السعودية", "/contact"],
              ["رسالة للمحرر", "/contact"],
            ]}
          />
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs">
          جميع الحقوق محفوظة لصحيفة عاجل © {new Date().getFullYear()} · صُنع بكل حب في الرياض
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="text-white text-sm mb-4 font-bold">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-xs text-ink-faint hover:text-white transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

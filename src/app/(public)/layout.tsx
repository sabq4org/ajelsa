import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { getBreakingHeadlines } from "@/lib/queries/articles";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headlines: string[] = [];
  try {
    headlines = await getBreakingHeadlines(5);
  } catch {
    // DB not available, use fallback
    headlines = [
      "وزير المالية: ميزانية 2026 الأكبر في تاريخ المملكة",
      "ارتفاع جماعي للأسواق الخليجية في تعاملات اليوم",
      "الأخضر يصل لربع نهائي كأس آسيا بثلاثية تاريخية",
    ];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader breakingHeadlines={headlines} />
      <main className="flex-1 relative z-5">{children}</main>
      <SiteFooter />
    </div>
  );
}

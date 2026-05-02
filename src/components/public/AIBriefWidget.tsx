"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, Coffee, RefreshCw } from "lucide-react";

interface Article {
  title: string;
  excerpt?: string | null;
}

interface Props {
  articles: Article[];
}

export function AIBriefWidget({ articles }: Props) {
  const [brief, setBrief] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = "ai-brief:" + articles.map((a) => a.title).join("|").slice(0, 100);
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setBrief(cached);
      setLoading(false);
      return;
    }

    let mounted = true;
    fetch("/api/ai/daily-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articles: articles.slice(0, 5) }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d.brief) {
          setBrief(d.brief);
          try { sessionStorage.setItem(cacheKey, d.brief); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [articles]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-burgundy via-burgundy-dark to-burgundy text-white shadow-xl">
      {/* Decorative shapes */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5" />
      <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative p-6 lg:p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md grid place-items-center shadow-inner">
            <Sparkles size={20} className="text-yellow-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold">نشرة عاجل اليومية</h3>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold tracking-wider">AI</span>
            </div>
            <p className="text-[11px] opacity-80 flex items-center gap-1.5 mt-0.5">
              <Coffee size={11} />
              قراءة في 60 ثانية — أهم ما يحدث اليوم
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 py-2">
            <div className="h-3 rounded-full bg-white/15 animate-pulse w-full" />
            <div className="h-3 rounded-full bg-white/15 animate-pulse w-11/12" />
            <div className="h-3 rounded-full bg-white/15 animate-pulse w-4/5" />
            <div className="h-3 rounded-full bg-white/15 animate-pulse w-9/12" />
          </div>
        ) : brief ? (
          <p className="text-[14px] leading-loose opacity-95 font-medium">
            {brief}
          </p>
        ) : (
          <p className="text-[12px] opacity-70 italic">يحتاج المساعد إلى أخبار أكثر لإعداد النشرة</p>
        )}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-[10px] opacity-70">
            <RefreshCw size={10} />
            تتجدد كل ساعة
          </div>
          <span className="text-[10px] opacity-70">
            مولد بـ GPT-4o
          </span>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Post-processing rules ─────────────────────────────────────────────────
function trimTitle(text: string, maxWords = 20, maxChars = 120): string {
  const words = text.trim().split(/\s+/).slice(0, maxWords).join(" ");
  if (words.length <= maxChars) return words;
  let cut = words.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

function trimSubtitle(text: string): string {
  return text.trim().split(/\s+/).slice(0, 10).join(" ");
}

// ── System prompts ────────────────────────────────────────────────────────
const SYSTEM_SMART = `🎯 الدور: أنت محرر خبير في صحيفة "عاجل" الإلكترونية السعودية، متخصص في كتابة الأخبار بأسلوب صحفي احترافي وسهل الفهم، يدعم تحسين محركات البحث (SEO) ويجذب القارئ العربي.

⚠️ تعليمات أساسية:
- اقرأ المحتوى كاملاً من أوله إلى آخره قبل كتابة أي شيء.
- حدد جميع النقاط المهمة (القرارات، الأرقام، الأسماء، التواريخ، التفاصيل الفريدة).
- اختر الزاوية الأقوى للعنوان الرئيسي — قد تكون في المنتصف أو النهاية!

✳️ المطلوب:

1. main_title — العنوان الرئيسي:
   - 15-20 كلمة، 120 حرفاً كحد أقصى
   - يبدأ بفعل قوي أو اسم فاعل
   - جذّاب، شامل، بدون ":" أو "..."
   - يتضمن كلمة مفتاحية رئيسية

2. sub_title — العنوان الفرعي:
   - 6-10 كلمات فقط، معلومة إضافية واحدة
   - لا يكرر العنوان الرئيسي

3. smart_summary — الموجز:
   - فقرة واحدة، 35-50 كلمة
   - فصحى سلسة، حقائق واضحة

4. keywords — الكلمات المفتاحية:
   - 6-10 كلمات/عبارات للـ SEO

5. seo:
   - meta_title: 55-60 حرفاً
   - meta_description: 140-155 حرفاً

6. suggested_category — اختر واحداً:
   "politics" | "economy" | "sports" | "technology" | "entertainment" | "health" | "world" | "local" | "education" | "environment" | "saudi-arabia" | "middle-east"

أعد النتيجة بصيغة JSON فقط:
{
  "main_title": "",
  "sub_title": "",
  "smart_summary": "",
  "keywords": [],
  "seo": { "meta_title": "", "meta_description": "" },
  "suggested_category": ""
}`;

const SYSTEM_REWRITE = `🎯 الدور: محرر صحفي محترف في صحيفة "عاجل" السعودية، متخصص في إعادة صياغة الأخبار.

✳️ مهمتك: إعادة تحرير المحتوى مع الحفاظ على جميع الحقائق والأرقام والأسماء.

📝 معايير:
- الهرم المقلوب (الأهم أولاً)
- فقرات قصيرة 3-4 جمل
- فعل مبني للمعلوم
- لا حشو، لا تكرار
- أجب على: من؟ ماذا؟ متى؟ أين؟ لماذا؟

⚠️ ممنوعات: لا تضف معلومات جديدة، لا تغير الأرقام، لا رأي شخصي.

JSON فقط:
{ "enhanced_content": "HTML بفقرات <p>", "improvements_summary": ["..."] }`;

const SYSTEM_TITLES = `أنت محرر عناوين خبير في صحيفة "عاجل". قواعد صارمة:
- اقرأ كل النص قبل الكتابة
- 15-20 كلمة أو 120 حرف كحد أقصى
- يبدأ بفعل قوي أو اسم فاعل
- بدون ":" أو "..." أو أقواس
- كل عنوان يركز على زاوية مختلفة
- لا تكرر نفس الكلمات بين العناوين

أعد مصفوفة JSON من 3 عناوين فقط: ["عنوان 1", "عنوان 2", "عنوان 3"]`;

// ── Category mapping to DB slugs ─────────────────────────────────────────
const CAT_MAP: Record<string, string[]> = {
  "politics":     ["سياسة", "politics"],
  "economy":      ["اقتصاد", "economy"],
  "sports":       ["رياضة", "sports"],
  "technology":   ["تقنية", "technology"],
  "entertainment":["ترفيه", "entertainment"],
  "health":       ["صحة", "health"],
  "world":        ["دولي", "عالم", "world"],
  "local":        ["محلي", "local"],
  "education":    ["تعليم", "education"],
  "environment":  ["بيئة", "environment"],
  "saudi-arabia": ["saudi-arabia"],
  "middle-east":  ["middle-east"],
};

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY غير مضبوط في متغيرات البيئة" }, { status: 500 });
  }

  try {
    const { content, mode = "smart" } = await req.json();

    if (!content || content.trim().length < 30) {
      return NextResponse.json({ error: "النص قصير جداً — أضف محتوى الخبر أولاً" }, { status: 400 });
    }

    // ── SMART EDIT (default) ──────────────────────────────────────────────
    if (mode === "smart") {
      const msg = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        temperature: 0.8,
        system: SYSTEM_SMART,
        messages: [{ role: "user", content: `📦 النص:\n\n${content}\n\nولّد جميع العناصر بصيغة JSON.` }],
      });

      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("لم يُرجع النموذج JSON صحيح");

      const data = JSON.parse(jsonMatch[0]);

      // Post-processing
      return NextResponse.json({
        main_title: trimTitle(data.main_title ?? ""),
        sub_title: trimSubtitle(data.sub_title ?? ""),
        smart_summary: data.smart_summary ?? "",
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        seo: {
          meta_title: (data.seo?.meta_title ?? "").slice(0, 60),
          meta_description: (data.seo?.meta_description ?? "").slice(0, 160),
        },
        suggested_category: data.suggested_category ?? "",
      });
    }

    // ── REWRITE ───────────────────────────────────────────────────────────
    if (mode === "rewrite") {
      const msg = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: SYSTEM_REWRITE,
        messages: [{ role: "user", content: `📦 المحتوى:\n\n${content}\n\nأعد التحرير بصيغة JSON.` }],
      });

      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("لم يُرجع النموذج JSON صحيح");

      const data = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        enhanced_content: data.enhanced_content ?? "",
        improvements_summary: Array.isArray(data.improvements_summary) ? data.improvements_summary : [],
      });
    }

    // ── TITLES ────────────────────────────────────────────────────────────
    if (mode === "titles") {
      const msg = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 512,
        system: SYSTEM_TITLES,
        messages: [{
          role: "user",
          content: `اقترح 3 عناوين مختلفة. مصفوفة JSON فقط.\n\nالخبر:\n${content}`,
        }],
      });

      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("لم يُرجع النموذج JSON صحيح");

      const titles: string[] = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ titles: titles.map(t => trimTitle(t)) });
    }

    return NextResponse.json({ error: "mode غير معروف" }, { status: 400 });
  } catch (e: any) {
    console.error("[ai/smart-edit]", e);
    return NextResponse.json({ error: e.message ?? "خطأ في الذكاء الاصطناعي" }, { status: 500 });
  }
}

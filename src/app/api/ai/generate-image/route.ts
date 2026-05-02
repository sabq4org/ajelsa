/**
 * /api/ai/generate-image — توليد صورة الخبر بـ Gemini
 */

export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  // ── 1. التحقق من المفتاح ───────────────────────────────────────────────
  const apiKey = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
  ].map((k) => k?.trim()).find((k) => k && k.length > 10);

  if (!apiKey) {
    return NextResponse.json(
      { error: "مفتاح Gemini فارغ أو غير صحيح — تحقق من قيمة GEMINI_API_KEY في Vercel" },
      { status: 500 }
    );
  }

  // ── 2. قراءة الطلب ────────────────────────────────────────────────────
  let title = "", excerpt = "", category = "", style = "photorealistic";
  try {
    const body = await req.json();
    title = body.title?.trim() ?? "";
    excerpt = body.excerpt?.trim() ?? "";
    category = body.category?.trim() ?? "";
    style = body.style?.trim() || "photorealistic";
  } catch {
    return NextResponse.json({ error: "طلب غير صحيح" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "العنوان مطلوب لتوليد الصورة" }, { status: 400 });
  }

  // ── 3. بناء البرومبت ──────────────────────────────────────────────────
  const isIllustration = style === "illustration";

  const prompt = isIllustration
    ? `IMPORTANT: This must be a FLAT DIGITAL ILLUSTRATION — NOT a photograph.
Draw a clean, modern 2D vector-style illustration for a news article.
Title: ${title}
${excerpt ? `Summary: ${excerpt}` : ""}
${category ? `Topic: ${category}` : ""}

STYLE REQUIREMENTS (strictly follow):
- Flat design, vector illustration aesthetic
- Soft pastel colors, clean shapes
- 2D icons, simplified characters
- Similar to medical / tech explainer infographic art
- Light blue/teal background tones with accent colors
- NOT photorealistic, NOT 3D render, NOT photograph
- No text, no letters, no watermarks`
    : `Create a photorealistic professional news photograph.
Title: ${title}
${excerpt ? `Summary: ${excerpt}` : ""}
${category ? `Category: ${category}` : ""}

Style: high-quality photojournalism, realistic lighting, documentary feel.
Culturally appropriate for Saudi Arabia.
No text, no watermarks, no logos.`;

  // ── 4. استدعاء Nano Banana Pro (gemini-3-pro-image-preview) ──────────────
  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: `فشل الاتصال بـ Nano Banana Pro: ${e.message}` }, { status: 502 });
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    console.error("[generate-image] Nano Banana Pro error:", geminiRes.status, errText);
    return NextResponse.json(
      { error: `Nano Banana Pro رفض الطلب (${geminiRes.status}) — ${errText.slice(0, 300)}` },
      { status: 502 }
    );
  }

  // ── 5. استخراج الصورة ─────────────────────────────────────────────────
  let data: any;
  try {
    data = await geminiRes.json();
  } catch (e: any) {
    return NextResponse.json({ error: `فشل قراءة رد النموذج: ${e.message}` }, { status: 502 });
  }

  // generateContent response: { candidates[0].content.parts[{inlineData}] }
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData?.data);

  if (!imagePart) {
    const reason = data?.candidates?.[0]?.finishReason ?? "UNKNOWN";
    console.error("[generate-image] no image part. finishReason:", reason);
    return NextResponse.json(
      { error: `لم يتمكن النموذج من توليد الصورة (${reason}) — جرب عنواناً مختلفاً` },
      { status: 422 }
    );
  }

  const base64: string = imagePart.inlineData.data;
  const mime: string = imagePart.inlineData.mimeType ?? "image/jpeg";
  const ext = mime.split("/")[1]?.split(";")[0] ?? "jpg";
  const buffer = Buffer.from(base64, "base64");

  // ── 6. رفع على R2 (أو data URL كاحتياطي لو R2 غير مضبوط) ──────────────
  const r2Ready = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);

  let url: string;

  if (r2Ready) {
    try {
      const uploaded = await uploadFile(buffer, {
        folder: "ai-generated",
        extension: ext,
        contentType: mime,
      });
      url = uploaded.url;
    } catch (e: any) {
      return NextResponse.json({ error: `فشل رفع الصورة على R2: ${e.message}` }, { status: 500 });
    }
  } else {
    // R2 غير مضبوط — نرجع data URL مباشرة
    url = `data:${mime};base64,${base64}`;
  }

  return NextResponse.json({ url });
}

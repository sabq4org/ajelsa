/**
 * /api/ai/generate-image — توليد صورة الخبر بـ Gemini (nano-banana-pro)
 */

export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const apiKey = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
  ].map((k) => k?.trim()).find((k) => k && k.length > 10);

  if (!apiKey) {
    const debug = [
      `GEMINI_API_KEY=${JSON.stringify(process.env.GEMINI_API_KEY?.slice(0, 8))}`,
    ].join(" ");
    console.error("[generate-image] API key empty or too short:", debug);
    return NextResponse.json(
      { error: `مفتاح Gemini فارغ أو غير صحيح — تحقق من قيمة GEMINI_API_KEY في Vercel` },
      { status: 500 }
    );
  }

  const { title, excerpt, category } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "العنوان مطلوب لتوليد الصورة" },
      { status: 400 }
    );
  }

  // ── بناء البرومبت ──────────────────────────────────────────────────────
  const prompt = `Create a professional news photograph for a Saudi Arabic news article.

Title: ${title}
${excerpt ? `Summary: ${excerpt}` : ""}
${category ? `Category: ${category}` : ""}

Requirements:
- Professional photojournalism quality, realistic style
- 16:9 widescreen composition
- Culturally appropriate for Saudi Arabia and Gulf region
- High visual impact, suitable for a news homepage
- Modern, clean, credible
- ABSOLUTELY NO TEXT, words, letters, numbers, or watermarks in the image
- No logos, no signs with writing
- Focus on visual storytelling through imagery only`;

  // ── استدعاء Gemini Image Generation ───────────────────────────────────
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("[generate-image] Gemini error:", err);
    return NextResponse.json(
      { error: "فشل توليد الصورة — تحقق من صحة مفتاح Gemini" },
      { status: 502 }
    );
  }

  const data = await response.json();

  // ── استخراج الصورة ─────────────────────────────────────────────────────
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData?.data);

  if (!imagePart) {
    return NextResponse.json(
      { error: "لم يتمكن النموذج من توليد صورة — جرب عنواناً مختلفاً" },
      { status: 422 }
    );
  }

  const base64 = imagePart.inlineData.data as string;
  const mime: string = imagePart.inlineData.mimeType ?? "image/png";
  const ext = mime.split("/")[1]?.split(";")[0] ?? "png";

  const buffer = Buffer.from(base64, "base64");

  // ── رفع على R2 ──────────────────────────────────────────────────────────
  const { url } = await uploadFile(buffer, {
    folder: "ai-generated",
    extension: ext,
    contentType: mime,
  });

  return NextResponse.json({ url });
}

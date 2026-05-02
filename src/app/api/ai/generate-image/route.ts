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

  // ── 4. استدعاء Imagen 4 (predict endpoint) ───────────────────────────
  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            ...(isIllustration ? { imageStyle: "DIGITAL_ART" } : {}),
          },
        }),
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: `فشل الاتصال بـ Imagen 4: ${e.message}` }, { status: 502 });
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    console.error("[generate-image] Imagen 4 error:", geminiRes.status, errText);
    return NextResponse.json(
      { error: `Imagen 4 رفض الطلب (${geminiRes.status}) — ${errText.slice(0, 300)}` },
      { status: 502 }
    );
  }

  // ── 5. استخراج الصورة ─────────────────────────────────────────────────
  let data: any;
  try {
    data = await geminiRes.json();
  } catch (e: any) {
    return NextResponse.json({ error: `فشل قراءة رد Imagen 4: ${e.message}` }, { status: 502 });
  }

  // Imagen 4 response: { predictions: [{ bytesBase64Encoded, mimeType }] }
  const prediction = data?.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    console.error("[generate-image] no image in Imagen 4 response:", JSON.stringify(data).slice(0, 400));
    return NextResponse.json(
      { error: `لم يتمكن النموذج من توليد الصورة — جرب عنواناً مختلفاً` },
      { status: 422 }
    );
  }

  const base64: string = prediction.bytesBase64Encoded;
  const mime: string = prediction.mimeType ?? "image/jpeg";
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

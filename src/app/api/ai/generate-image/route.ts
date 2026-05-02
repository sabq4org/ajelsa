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
  let title = "", excerpt = "", category = "";
  try {
    const body = await req.json();
    title = body.title?.trim() ?? "";
    excerpt = body.excerpt?.trim() ?? "";
    category = body.category?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "طلب غير صحيح" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "العنوان مطلوب لتوليد الصورة" }, { status: 400 });
  }

  // ── 3. بناء البرومبت ──────────────────────────────────────────────────
  const prompt = `Create a professional news photograph for a Saudi Arabic news article.
Title: ${title}
${excerpt ? `Summary: ${excerpt}` : ""}
${category ? `Category: ${category}` : ""}
Style: professional photojournalism, realistic, 16:9 composition.
Culturally appropriate for Saudi Arabia. No text, no watermarks, no logos.`;

  // ── 4. استدعاء Imagen 3 ───────────────────────────────────────────────
  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" },
        }),
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: `فشل الاتصال بـ Imagen: ${e.message}` }, { status: 502 });
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    console.error("[generate-image] Imagen HTTP error:", geminiRes.status, errText);
    return NextResponse.json(
      { error: `Imagen رفض الطلب (${geminiRes.status}) — ${errText.slice(0, 300)}` },
      { status: 502 }
    );
  }

  // ── 5. استخراج الصورة ─────────────────────────────────────────────────
  let data: any;
  try {
    data = await geminiRes.json();
  } catch (e: any) {
    return NextResponse.json({ error: `فشل قراءة رد Imagen: ${e.message}` }, { status: 502 });
  }

  // Imagen 3 response: { predictions: [{ bytesBase64Encoded, mimeType }] }
  const prediction = data?.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    console.error("[generate-image] no image in Imagen response:", JSON.stringify(data).slice(0, 400));
    return NextResponse.json(
      { error: "لم يتمكن النموذج من توليد الصورة — جرب عنواناً مختلفاً" },
      { status: 422 }
    );
  }

  const base64: string = prediction.bytesBase64Encoded;
  const mime: string = prediction.mimeType ?? "image/png";
  const ext = mime.split("/")[1]?.split(";")[0] ?? "png";
  const buffer = Buffer.from(base64, "base64");

  // ── 6. رفع على R2 ─────────────────────────────────────────────────────
  let url: string;
  try {
    const uploaded = await uploadFile(buffer, {
      folder: "ai-generated",
      extension: ext,
      contentType: mime,
    });
    url = uploaded.url;
  } catch (e: any) {
    return NextResponse.json({ error: `فشل رفع الصورة: ${e.message}` }, { status: 500 });
  }

  return NextResponse.json({ url });
}

/**
 * /api/ai/generate-image
 * واقعية  → Imagen 4 (Google)
 * رسومية  → DALL-E 3 (OpenAI) — أفضل نموذج للـ flat illustration
 */

export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { uploadToCloudinary, isCloudinaryReady } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  // ── 2. قراءة الطلب ────────────────────────────────────────────────────
  let title = "", excerpt = "", category = "", style = "photorealistic";
  try {
    const body = await req.json();
    title    = body.title?.trim()    ?? "";
    excerpt  = body.excerpt?.trim()  ?? "";
    category = body.category?.trim() ?? "";
    style    = body.style?.trim()    || "photorealistic";
  } catch {
    return NextResponse.json({ error: "طلب غير صحيح" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "العنوان مطلوب لتوليد الصورة" }, { status: 400 });
  }

  const isIllustration = style === "illustration";

  // ── تفرقة النموذج حسب النمط ───────────────────────────────────────────
  if (isIllustration) {
    return generateIllustration({ title, excerpt, category });
  } else {
    return generatePhoto({ title, excerpt, category });
  }
}

// ══════════════════════════════════════════════════════════════════════════
// رسومية — DALL-E 3 (OpenAI)
// ══════════════════════════════════════════════════════════════════════════
async function generateIllustration({ title, excerpt, category }: Record<string, string>) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY غير مضبوط — لا يمكن توليد صورة رسومية" },
      { status: 500 }
    );
  }

  const prompt = `Flat digital illustration for a news article. NO photographs, NO realism.
Style: clean vector art, soft pastel colors, 2D characters, medical/tech infographic aesthetic.
Topic: ${title}${excerpt ? `. ${excerpt}` : ""}${category ? `. Category: ${category}` : ""}.
Background: light gradient. No text, no letters, no watermarks anywhere.`;

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "standard",
        style: "vivid",
        response_format: "b64_json",
      }),
    });
  } catch (e: any) {
    return NextResponse.json({ error: `فشل الاتصال بـ DALL-E: ${e.message}` }, { status: 502 });
  }

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `DALL-E رفض الطلب (${res.status}) — ${err.slice(0, 200)}` },
      { status: 502 }
    );
  }

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json as string | undefined;
  if (!b64) {
    return NextResponse.json({ error: "لم يُرجع DALL-E صورة" }, { status: 422 });
  }

  return saveAndReturn(b64, "image/png", "png");
}

// ══════════════════════════════════════════════════════════════════════════
// واقعية — Imagen 4 (Google)
// ══════════════════════════════════════════════════════════════════════════
async function generatePhoto({ title, excerpt, category }: Record<string, string>) {
  const apiKey = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  ].map((k) => k?.trim()).find((k) => k && k.length > 10);

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY غير مضبوط" },
      { status: 500 }
    );
  }

  const prompt = `Photorealistic professional news photograph.
Title: ${title}${excerpt ? `\nSummary: ${excerpt}` : ""}${category ? `\nCategory: ${category}` : ""}
Style: high-quality photojournalism, realistic lighting, documentary feel.
Culturally appropriate for Saudi Arabia. No text, no watermarks.`;

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
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
    return NextResponse.json({ error: `فشل الاتصال بـ Imagen 4: ${e.message}` }, { status: 502 });
  }

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Imagen 4 رفض الطلب (${res.status}) — ${err.slice(0, 200)}` },
      { status: 502 }
    );
  }

  const data = await res.json();
  const prediction = data?.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    return NextResponse.json({ error: "لم يُرجع Imagen 4 صورة — جرب عنواناً مختلفاً" }, { status: 422 });
  }

  return saveAndReturn(
    prediction.bytesBase64Encoded,
    prediction.mimeType ?? "image/jpeg",
    "jpg"
  );
}

// ══════════════════════════════════════════════════════════════════════════
// حفظ الصورة وإرجاع الـ URL
// ══════════════════════════════════════════════════════════════════════════
async function saveAndReturn(base64: string, mime: string, ext: string): Promise<NextResponse> {
  const buffer = Buffer.from(base64, "base64");

  // ① Cloudinary — التفضيل الأول
  if (isCloudinaryReady()) {
    try {
      const url = await uploadToCloudinary(buffer, "ai-generated");
      return NextResponse.json({ url });
    } catch (e: any) {
      console.error("[generate-image] Cloudinary upload failed:", e.message);
    }
  }

  // ② R2 — التفضيل الثاني
  const r2Ready = !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );

  if (r2Ready) {
    try {
      const { url } = await uploadFile(buffer, { folder: "ai-generated", extension: ext, contentType: mime });
      return NextResponse.json({ url });
    } catch (e: any) {
      console.error("[generate-image] R2 upload failed:", e.message);
    }
  }

  // ③ حل أخير — Data URL
  return NextResponse.json({ url: `data:${mime};base64,${base64}` });
}

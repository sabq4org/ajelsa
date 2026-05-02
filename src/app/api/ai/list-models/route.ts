import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "no key" });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`
  );
  const data = await res.json();

  // فلتر النماذج التي تدعم توليد الصور
  const imageModels = (data.models ?? []).filter((m: any) =>
    JSON.stringify(m).toLowerCase().includes("imag") ||
    (m.supportedGenerationMethods ?? []).includes("predict") ||
    m.name?.includes("imagen")
  );

  return NextResponse.json({
    total: data.models?.length ?? 0,
    imageRelated: imageModels.map((m: any) => ({
      name: m.name,
      methods: m.supportedGenerationMethods,
    })),
    all: (data.models ?? []).map((m: any) => ({
      name: m.name,
      methods: m.supportedGenerationMethods,
    })),
  });
}

/**
 * /api/upload — Image upload (Cloudinary → R2 → Local fallback)
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { uploadToCloudinary, isCloudinaryReady } from "@/lib/cloudinary";
import { db, media } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("writer");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ملف مطلوب" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يتجاوز 10 ميجا" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";

    let url: string;
    let key: string;

    // ① Cloudinary
    if (isCloudinaryReady()) {
      url = await uploadToCloudinary(buffer, "articles");
      key = url.split("/").slice(-2).join("/");
    } else {
      // ② R2 / Local
      const result = await uploadFile(buffer, {
        folder: "articles",
        extension: ext,
        contentType: file.type,
      });
      url = result.url;
      key = result.key;
    }

    const [record] = await db
      .insert(media)
      .values({
        filename: key,
        originalFilename: file.name,
        url,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadedBy: session.userId,
      })
      .returning();

    return NextResponse.json({ media: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

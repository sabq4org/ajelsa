/**
 * /api/media — list (admin)
 */
import { NextRequest } from "next/server";
import { db, media, users } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { ok, fromError, ensureRole } from "@/lib/api";

export async function GET() {
  try {
    await ensureRole("writer");
    const items = await db
      .select({
        id: media.id,
        filename: media.filename,
        originalFilename: media.originalFilename,
        url: media.url,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        width: media.width,
        height: media.height,
        altText: media.altText,
        caption: media.caption,
        createdAt: media.createdAt,
        uploaderName: users.fullName,
      })
      .from(media)
      .leftJoin(users, eq(media.uploadedBy, users.id))
      .orderBy(desc(media.createdAt))
      .limit(200);
    return ok({ items });
  } catch (e) {
    return fromError(e);
  }
}

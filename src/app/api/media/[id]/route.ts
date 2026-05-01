/**
 * /api/media/[id] — delete
 */
import { NextRequest } from "next/server";
import { db, media } from "@/lib/db";
import { eq } from "drizzle-orm";
import { noContent, fromError, ensureRole, notFound } from "@/lib/api";
import { deleteFile } from "@/lib/storage";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureRole("editor");
    const { id } = await params;
    const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (!row) return notFound("الملف غير موجود");
    try {
      await deleteFile(row.filename);
    } catch {}
    await db.delete(media).where(eq(media.id, id));
    return noContent();
  } catch (e) {
    return fromError(e);
  }
}

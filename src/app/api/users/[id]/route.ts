/**
 * /api/users/[id]
 */
import { NextRequest } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ok, noContent, notFound, badRequest, fromError, ensureRole } from "@/lib/api";
import { hashPassword } from "@/lib/auth";

const updateSchema = z.object({
  fullName: z.string().min(2).max(200).optional(),
  bio: z.string().optional().nullable(),
  twitterHandle: z.string().max(50).optional().nullable(),
  role: z.enum(["super_admin", "editor_in_chief", "editor", "writer", "contributor"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await ensureRole("editor_in_chief");
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updates: any = { ...data, updatedAt: new Date() };
    if (data.password) {
      updates.passwordHash = await hashPassword(data.password);
      delete updates.password;
    }

    const [row] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
      });
    if (!row) return notFound("المستخدم غير موجود");
    return ok({ user: row });
  } catch (e) {
    return fromError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await ensureRole("editor_in_chief");
    const { id } = await params;
    if (id === session.userId) return badRequest("لا يمكنك حذف حسابك");
    await db.delete(users).where(eq(users.id, id));
    return noContent();
  } catch (e) {
    return fromError(e);
  }
}

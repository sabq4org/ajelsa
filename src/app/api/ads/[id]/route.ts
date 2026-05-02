import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [ad] = await db.update(ads).set({
      ...body,
      updatedAt: new Date(),
    }).where(eq(ads.id, id)).returning();
    return NextResponse.json({ ad });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(ads).where(eq(ads.id, id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

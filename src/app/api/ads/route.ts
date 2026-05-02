import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ads } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(ads).orderBy(desc(ads.createdAt));
    return NextResponse.json({ ads: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [ad] = await db.insert(ads).values({
      title: body.title,
      position: body.position,
      imageUrl: body.imageUrl || null,
      linkUrl: body.linkUrl || null,
      advertiser: body.advertiser || null,
      isActive: body.isActive ?? true,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    }).returning();
    return NextResponse.json({ ad }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

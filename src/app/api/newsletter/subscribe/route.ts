import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { email, name, source } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
    }
    await db.insert(newsletterSubscribers).values({ email, name, source: source || "website" })
      .onConflictDoUpdate({ target: newsletterSubscribers.email, set: { isActive: true, unsubscribedAt: null } });
    return NextResponse.json({ ok: true, message: "تم الاشتراك بنجاح" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

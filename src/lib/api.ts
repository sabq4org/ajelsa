/**
 * API helpers — موحّد للـ Routes
 */
import { NextResponse } from "next/server";
import { getSession, hasRole, type SessionPayload } from "./auth";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = "غير مسجّل دخول") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "ليس لديك صلاحية") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "غير موجود") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function serverError(err: unknown) {
  console.error("[API Error]", err);
  const message = err instanceof Error ? err.message : "خطأ غير متوقع";
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * يلتقط ZodError ويرجّع 400 منظم
 */
export function fromError(err: unknown) {
  if (err instanceof ZodError) {
    return badRequest("بيانات غير صحيحة", err.flatten());
  }
  if (err instanceof Error && err.message === "UNAUTHENTICATED") {
    return unauthorized();
  }
  if (err instanceof Error && err.message === "FORBIDDEN") {
    return forbidden();
  }
  return serverError(err);
}

/**
 * يفرض المصادقة، يرجّع session أو يرمي
 */
export async function ensureAuth(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  return s;
}

/**
 * يفرض دور معين
 */
export async function ensureRole(required: string): Promise<SessionPayload> {
  const s = await ensureAuth();
  if (!hasRole(s.role, required)) throw new Error("FORBIDDEN");
  return s;
}

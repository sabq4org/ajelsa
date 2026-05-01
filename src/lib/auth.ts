/**
 * Authentication — JWT sessions stored as httpOnly cookies
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-32chars-aaaa"
);
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "ajel_session";
const SESSION_DURATION = "30d";

export type SessionPayload = JWTPayload & {
  userId: string;
  email: string;
  role: string;
  fullName: string;
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function loginByEmail(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.isActive) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  const token = await signSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  return { user, token };
}

// Role hierarchy
const ROLE_LEVELS: Record<string, number> = {
  contributor: 1,
  writer: 2,
  editor: 3,
  editor_in_chief: 4,
  super_admin: 5,
};

export function hasRole(userRole: string, required: string): boolean {
  return (ROLE_LEVELS[userRole] ?? 0) >= (ROLE_LEVELS[required] ?? 0);
}

export async function requireRole(required: string) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (!hasRole(session.role, required)) throw new Error("FORBIDDEN");
  return session;
}

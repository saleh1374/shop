import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

const SESSION_COOKIE = "session";
const TTL = 60 * 60 * 24 * 7; // ۷ روز

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET تنظیم نشده است");
  return new TextEncoder().encode(secret);
}

export type SessionUser = { id: string; role: Role };

export async function createSession(userId: string, role: Role) {
  const token = await new SignJWT({ id: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(getSecret());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.id || typeof payload.id !== "string") return null;
    return { id: payload.id, role: payload.role as Role };
  } catch {
    return null;
  }
});

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/account");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/account/login?next=/admin");
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true },
  });
}

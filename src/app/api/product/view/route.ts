import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const viewAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = viewAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    viewAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!checkRate(ip)) {
      return NextResponse.json({ ok: true });
    }

    const { productId } = await req.json();
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    await db.product.update({
      where: { id: productId },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

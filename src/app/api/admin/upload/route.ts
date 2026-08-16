import { NextResponse } from "next/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

// Rate limiting ساده (حافظه درون‌进程ی)
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = uploadAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    uploadAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const session = await requireAdmin().catch(() => null);
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "تعداد درخواست‌ها زیاد است. لطفاً کمی صبر کنید." }, { status: 429 });
  }

  // بررسی Origin header برای جلوگیری از CSRF
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({ error: "درخواست غیرمجاز" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "فرمت فایل مجاز نیست (jpg, png, webp, svg, gif)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "حجم فایل حداکثر ۵ مگابایت است" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeExt = ext === "jpeg" ? "jpg" : ext;
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
  const dir = join(process.cwd(), "public", "uploads", "products");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/products/${filename}` });
}

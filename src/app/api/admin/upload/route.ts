import { NextResponse } from "next/server";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // ۵ مگابایت

export async function POST(req: Request) {
  const session = await requireAdmin().catch(() => null);
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });

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

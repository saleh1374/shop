import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
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

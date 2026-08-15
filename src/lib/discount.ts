import { db } from "@/lib/db";

export type DiscountResult =
  | { ok: true; amount: number; codeId: string; description: string }
  | { ok: false; error: string };

/** محاسبه تخفیف یک کد روی مبلغ سبد */
export async function applyDiscount(
  code: string,
  subtotal: number
): Promise<DiscountResult> {
  if (!code.trim()) return { ok: true, amount: 0, codeId: "", description: "" };
  const d = await db.discountCode.findUnique({ where: { code: code.trim() } });
  if (!d || !d.active) return { ok: false, error: "کد تخفیف معتبر نیست" };
  if (d.expiresAt && d.expiresAt < new Date()) return { ok: false, error: "کد تخفیف منقضی شده است" };
  if (d.usageLimit !== null && d.usageLimit !== undefined && d.usedCount >= d.usageLimit)
    return { ok: false, error: "سقف استفاده از این کد تکمیل شده است" };
  if (d.minAmount && subtotal < d.minAmount)
    return { ok: false, error: `حداقل مبلغ سبد برای این کد ${d.minAmount.toLocaleString("fa-IR")} تومان است` };

  let amount = 0;
  if (d.type === "PERCENT") {
    amount = Math.round((subtotal * d.value) / 100);
    if (d.maxAmount && amount > d.maxAmount) amount = d.maxAmount;
  } else {
    amount = Math.min(d.value, subtotal);
  }
  return {
    ok: true,
    amount,
    codeId: d.id,
    description: d.type === "PERCENT" ? `تخفیف ${d.value}٪` : `تخفیف ${d.value.toLocaleString("fa-IR")} تومانی`,
  };
}

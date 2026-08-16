import { getSettings, setting } from "@/lib/settings";

export async function shippingFee(subtotal: number) {
  const s = await getSettings();
  const fee = Math.max(0, Number(setting(s, "shipping_fee", "35000")) || 0);
  const threshold = Math.max(0, Number(setting(s, "free_shipping_threshold", "3000000")) || 0);
  const free = threshold > 0 && subtotal >= threshold;
  return { fee: free ? 0 : fee, free, threshold };
}
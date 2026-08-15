// ============================================================
// سرویس درگاه پرداخت — نسخه آزمایشی (Placeholder)
//
// برای اتصال درگاه واقعی (زرین‌پال، وندار، ...) فقط باید یک کلاس
// جدید با اینترفیس PaymentGateway بسازی و در getGateway ثبت کنی.
// هیچ تغییری در سفارش‌ها لازم نیست؛ کلیدهای هر درگاه در جدول
// Setting پنل ادمین ذخیره می‌شود.
// ============================================================

import type { Order } from "@/generated/prisma/client";
import { getSettings } from "@/lib/settings";

export interface PaymentResult {
  ok: boolean;
  /** آدرس صفحه پرداخت (برای درگاه‌های redirect) */
  url?: string;
  /** کد پیگیری/مرجع پرداخت */
  ref?: string;
  error?: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  /** شروع فرآیند پرداخت یک سفارش */
  requestPayment(order: Order): Promise<PaymentResult>;
  /** تایید پرداخت پس از بازگشت از درگاه */
  verifyPayment(order: Order, params: Record<string, string>): Promise<PaymentResult>;
}

// ------------------------------------------------------------
// درگاه آزمایشی (شبیه‌سازی) — پرداخت واقعی انجام نمی‌شود
// ------------------------------------------------------------
class SimulationGateway implements PaymentGateway {
  id = "simulation";
  name = "پرداخت آزمایشی";

  async requestPayment(order: Order) {
    return { ok: true, ref: `SIM-${order.orderNumber}` };
  }

  async verifyPayment(order: Order, params: Record<string, string>) {
    if (params.status === "ok") {
      return { ok: true, ref: `SIM-${order.orderNumber}` };
    }
    return { ok: false, error: "پرداخت انجام نشد" };
  }
}

// ------------------------------------------------------------
// ثبت درگاه‌ها — درگاه‌های واقعی را بعداً اینجا اضافه کن
// ------------------------------------------------------------
const gateways: Record<string, PaymentGateway> = {
  simulation: new SimulationGateway(),
};

export function getGateway(id: string): PaymentGateway {
  return gateways[id] ?? gateways.simulation;
}

export function getActiveGateway(): PaymentGateway {
  // تنظیم "payment_gateway" در پنل ادمین مشخص می‌کند کدام درگاه فعال است
  // هنوز درگاه واقعی فعال نشده؛ پس همیشه آزمایشی برمی‌گرداند.
  return gateways.simulation;
}

export function gatewayOptions() {
  return Object.values(gateways).map((g) => ({ id: g.id, name: g.name }));
}

export function isZarinpalConfigured() {
  return false;
}

export async function getPaymentSettings() {
  const s = await getSettings();
  return {
    enabled: false,
    activeGateway: "simulation",
    zarinpalMerchant: s.zarinpal_merchant ?? "",
    enamadCode: s.enamad_code ?? "",
  };
}

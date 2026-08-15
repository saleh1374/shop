import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toFa, toToman } from "@/lib/format";
import { getActiveGateway } from "@/lib/payment";
import PayButton from "@/components/pay-button";
import { CreditCardIcon, ShieldIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status !== "PENDING") notFound();

  const gateway = getActiveGateway();

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-l from-indigo-600 to-violet-600 text-white p-6 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <CreditCardIcon className="w-7 h-7" />
          </span>
          <h1 className="text-xl font-black">پرداخت آنلاین</h1>
          <p className="text-sm text-indigo-100 mt-1">
            درگاه: {gateway.name} — سفارش #{toFa(order.orderNumber)}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-500">جمع سفارش</span>
              <span className="font-bold text-slate-700">{toToman(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500">تخفیف</span>
                <span className="font-bold text-emerald-600">− {toToman(order.discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800">مبلغ قابل پرداخت</span>
              <span className="text-2xl font-black text-indigo-700">{toToman(order.total)}</span>
            </div>
          </div>

          <PayButton orderId={order.id} />

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
            <ShieldIcon className="w-4 h-4" />
            این یک پرداخت آزمایشی است؛ پس از اتصال درگاه واقعی (زرین‌پال و...) به‌صورت خودکار فعال می‌شود.
          </div>

          <Link
            href={`/account/orders`}
            className="block text-center text-sm text-slate-500 hover:text-indigo-600 mt-3"
          >
            انصراف از پرداخت و بازگشت
          </Link>
        </div>
      </div>
    </div>
  );
}

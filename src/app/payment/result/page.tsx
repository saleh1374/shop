import Link from "next/link";
import { db } from "@/lib/db";
import { toFa, toToman, formatDateTime, orderStatusLabel } from "@/lib/format";
import { CheckIcon, TruckIcon, XIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; status?: string }>;
}) {
  const { order: orderNumber, status } = await searchParams;

  const order = orderNumber
    ? await db.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      })
    : null;

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-10">
          <span className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <XIcon className="w-8 h-8" />
          </span>
          <h1 className="text-xl font-black text-slate-800 mb-2">سفارش یافت نشد</h1>
          <Link href="/products" className="inline-block mt-4 text-indigo-600 font-bold">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const paid = status === "success";
  const cod = status === "cod";
  const ok = paid || cod;

  const st = orderStatusLabel(order.status);

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div
          className={`p-8 text-center text-white ${
            ok ? "bg-gradient-to-l from-emerald-600 to-teal-600" : "bg-gradient-to-l from-red-500 to-rose-600"
          }`}
        >
          <span className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
            {ok ? <CheckIcon className="w-9 h-9" /> : <XIcon className="w-9 h-9" />}
          </span>
          <h1 className="text-2xl font-black">
            {paid
              ? "پرداخت با موفقیت انجام شد"
              : cod
                ? "سفارش شما ثبت شد"
                : "پرداخت ناموفق بود"}
          </h1>
          <p className="text-sm text-white/80 mt-2">
            شماره سفارش: {toFa(order.orderNumber)}
          </p>
        </div>

        <div className="p-6 space-y-3 text-sm">
          {cod && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs leading-6">
              روش پرداخت شما «پرداخت در محل» است؛ مبلغ را هنگام تحویل سفارش بپردازید.
            </div>
          )}
          {paid && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs leading-6">
              کد پیگیری پرداخت: {order.paymentRef ?? "-"}
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">مبلغ سفارش</span>
            <span className="font-black text-slate-800">{toToman(order.total)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">وضعیت</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${st.color}`}>{st.label}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">تاریخ ثبت</span>
            <span className="font-bold text-slate-700">{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">تعداد اقلام</span>
            <span className="font-bold text-slate-700">
              {toFa(order.items.reduce((s, i) => s + i.quantity, 0))} عدد
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/account/orders"
              className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
            >
              <TruckIcon className="w-5 h-5" /> پیگیری سفارش
            </Link>
            <Link
              href="/products"
              className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:border-indigo-400 transition"
            >
              ادامه خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

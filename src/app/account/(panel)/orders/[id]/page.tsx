import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDateTime, orderStatusLabel } from "@/lib/format";
import OrderActions from "@/components/order-actions";
import { ChevronIcon, InvoiceIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });

  if (!order || order.userId !== session.id) notFound();

  const st = orderStatusLabel(order.status);

  const steps = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
  const currentIdx = steps.indexOf(order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-4"
      >
        <ChevronIcon className="w-4 h-4 rotate-180" /> بازگشت به حساب
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h1 className="text-xl font-black text-slate-800">سفارش #{toFa(order.orderNumber)}</h1>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${st.color}`}>{st.label}</span>
        </div>
        <p className="text-xs text-slate-400 mb-6">تاریخ ثبت: {formatDateTime(order.createdAt)}</p>

        {!cancelled ? (
          <div className="flex items-center">
            {steps.map((s, i) => {
              const done = i <= currentIdx;
              const labels = ["ثبت سفارش", "پرداخت", "ارسال", "تحویل"];
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                        done ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {toFa(i + 1)}
                    </span>
                    <span className={`text-[11px] mt-1.5 ${done ? "text-indigo-600 font-bold" : "text-slate-400"}`}>
                      {labels[i]}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-5 rounded ${
                        i < currentIdx ? "bg-indigo-600" : "bg-slate-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            این سفارش لغو شده است.
          </div>
        )}

        <div className="mt-5">
          <OrderActions orderId={order.id} status={order.status} />
        </div>
        <Link
          href={`/invoice/${order.orderNumber}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-4"
        >
          <InvoiceIcon className="w-4 h-4" /> مشاهده فاکتور رسمی
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-3 text-sm">اطلاعات گیرنده</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-400 text-xs">نام:</span> <span className="font-bold">{order.customerName}</span></div>
            <div><span className="text-slate-400 text-xs">موبایل:</span> <span className="font-bold" dir="ltr">{order.customerPhone}</span></div>
            {order.customerEmail && <div><span className="text-slate-400 text-xs">ایمیل:</span> <span className="font-bold" dir="ltr">{order.customerEmail}</span></div>}
            {order.address && <div><span className="text-slate-400 text-xs">آدرس:</span> <span className="font-bold">{order.address}</span></div>}
            {order.note && <div><span className="text-slate-400 text-xs">توضیحات:</span> <span className="font-bold">{order.note}</span></div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-3 text-sm">اقلام سفارش</h2>
          <div className="space-y-2 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                {item.product ? (
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-slate-600 font-bold line-clamp-1 hover:text-indigo-600"
                  >
                    {item.productName}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-bold line-clamp-1">{item.productName}</span>
                )}
                <span className="text-xs text-slate-400 shrink-0">
                  {toFa(item.quantity)} × {toToman(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">جمع کالاها</span><span className="font-bold">{toToman(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600"><span>تخفیف</span><span className="font-bold">− {toToman(order.discount)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-slate-500">هزینه ارسال</span><span className={`font-bold ${order.shippingCost === 0 ? "text-emerald-600" : ""}`}>{order.shippingCost === 0 ? "رایگان" : toToman(order.shippingCost)}</span></div>
          <div className="border-t border-dashed border-slate-200 my-3" />
          <div className="flex justify-between">
            <span className="font-black text-slate-800">مبلغ نهایی</span>
            <span className="text-xl font-black text-indigo-700">{toToman(order.total)}</span>
          </div>
          {order.paymentRef && (
            <div className="text-xs text-slate-400 mt-2">
              کد پیگیری پرداخت: <span dir="ltr">{order.paymentRef}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDateTime, orderStatusLabel } from "@/lib/format";
import { getSettings, setting } from "@/lib/settings";
import InvoicePrintButton from "@/components/invoice-print-button";
import { InvoiceIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await requireUser();
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw);

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();
  if (order.userId !== session.id && session.role !== "ADMIN") notFound();

  const settings = await getSettings();
  const storeName = setting(settings, "store_name", "فروشگاه");
  const storeAddress = setting(settings, "address", "");
  const storePhone = setting(settings, "phone", "");
  const st = orderStatusLabel(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 no-print">
        <Link href={session.role === "ADMIN" ? "/admin/orders" : "/account/orders"} className="text-sm text-slate-500 hover:text-indigo-600">
          ← بازگشت به سفارش‌ها
        </Link>
        <InvoicePrintButton />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-l from-indigo-600 to-violet-600 text-white px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <InvoiceIcon className="w-6 h-6" />
            </span>
            <div>
              <div className="font-black text-lg">{storeName}</div>
              <div className="text-xs text-indigo-100">فاکتور رسمی فروش</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs text-indigo-100">شماره فاکتور</div>
            <div className="font-black text-lg" dir="ltr">{toFa(order.orderNumber)}</div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-dashed border-slate-200">
            <div>
              <div className="text-xs text-slate-400 mb-1">تاریخ صدور</div>
              <div className="text-sm font-bold text-slate-800">{formatDateTime(order.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">وضعیت</div>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${st.color}`}>{st.label}</span>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">روش پرداخت</div>
              <div className="text-sm font-bold text-slate-800">
                {order.paymentGateway === "cod" ? "پرداخت در محل" : "پرداخت آنلاین"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-dashed border-slate-200">
            <div>
              <div className="text-xs text-slate-400 mb-2 font-bold">گیرنده</div>
              <div className="text-sm font-bold text-slate-800">{order.customerName}</div>
              <div className="text-sm text-slate-600 mt-1" dir="ltr">{order.customerPhone}</div>
              {order.customerEmail && (
                <div className="text-sm text-slate-600 mt-1" dir="ltr">{order.customerEmail}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2 font-bold">فروشگاه</div>
              <div className="text-sm font-bold text-slate-800">{storeName}</div>
              {storeAddress && <div className="text-sm text-slate-600 mt-1 leading-6">{storeAddress}</div>}
              {storePhone && <div className="text-sm text-slate-600 mt-1" dir="ltr">{storePhone}</div>}
            </div>
          </div>

          <table className="w-full mt-5 text-sm">
            <thead>
              <tr className="text-right text-xs text-slate-400 border-b border-slate-100">
                <th className="py-2 font-bold">کالا</th>
                <th className="py-2 font-bold text-center">تعداد</th>
                <th className="py-2 font-bold text-center">قیمت واحد</th>
                <th className="py-2 font-bold text-center">جمع</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="py-3 font-bold text-slate-800">{item.productName}</td>
                  <td className="py-3 text-center text-slate-600">{toFa(item.quantity)}</td>
                  <td className="py-3 text-center text-slate-600">{toToman(item.price)}</td>
                  <td className="py-3 text-center font-bold text-slate-800">{toToman(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 max-w-xs mr-auto space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>جمع کالاها</span>
              <span className="font-bold">{toToman(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>تخفیف</span>
                <span className="font-bold">− {toToman(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>هزینه ارسال</span>
              <span className="font-bold">{order.shippingCost === 0 ? "رایگان" : toToman(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-3">
              <span className="font-black text-slate-800">مبلغ نهایی</span>
              <span className="font-black text-xl text-indigo-700">{toToman(order.total)}</span>
            </div>
            {order.paymentRef && (
              <div className="text-xs text-slate-400 text-left" dir="ltr">
                کد پیگیری: {order.paymentRef}
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            {order.address && <div className="mb-1">آدرس تحویل: {order.address}</div>}
            با تشکر از خرید شما از {storeName}
          </div>
        </div>
      </div>
    </div>
  );
}
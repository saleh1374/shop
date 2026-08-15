import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate, orderStatusLabel } from "@/lib/format";
import { BoxIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: session.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <BoxIcon className="w-7 h-7 text-indigo-600" /> سفارش‌های من
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">هنوز سفارشی ثبت نکرده‌اید</p>
          <Link
            href="/products"
            className="inline-block mt-4 bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-right p-4 font-bold">شماره سفارش</th>
                <th className="text-right p-4 font-bold hidden sm:table-cell">تاریخ</th>
                <th className="text-right p-4 font-bold">مبلغ</th>
                <th className="text-right p-4 font-bold">وضعیت</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const st = orderStatusLabel(o.status);
                return (
                  <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition">
                    <td className="p-4 font-bold text-indigo-700">#{toFa(o.orderNumber)}</td>
                    <td className="p-4 text-slate-500 hidden sm:table-cell">{formatDate(o.createdAt)}</td>
                    <td className="p-4 font-extrabold text-slate-800">{toToman(o.total)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/account/orders/${o.id}`}
                        className="text-indigo-600 font-bold text-xs hover:text-indigo-800"
                      >
                        جزئیات
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

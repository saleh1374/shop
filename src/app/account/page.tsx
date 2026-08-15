import Link from "next/link";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/app/actions";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate, orderStatusLabel } from "@/lib/format";
import { BoxIcon, UserIcon, LogoutIcon, ChevronIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await requireUser();
  const user = await getCurrentUser();
  const orders = await db.order.findMany({
    where: { userId: user?.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserIcon className="w-6 h-6" />
            </span>
            <div>
              <div className="font-black text-slate-800">{user?.name}</div>
              <div className="text-sm text-slate-500" dir="ltr">{user?.email}</div>
            </div>
          </div>
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition"
            >
              <LogoutIcon className="w-4 h-4" /> خروج
            </button>
          </form>
        </div>
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="inline-block mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            ← ورود به پنل مدیریت
          </Link>
        )}
      </div>

      <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
        <BoxIcon className="w-6 h-6 text-indigo-600" /> سفارش‌های اخیر
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
          هنوز سفارشی ثبت نکرده‌اید.
          <Link href="/products" className="block mt-3 text-indigo-600 font-bold">
            شروع خرید
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const st = orderStatusLabel(o.status);
            return (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 hover:border-indigo-300 transition group"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    سفارش #{toFa(o.orderNumber)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{formatDate(o.createdAt)}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-indigo-700 hidden sm:block">
                    {toToman(o.total)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${st.color}`}>
                    {st.label}
                  </span>
                  <ChevronIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

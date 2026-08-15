import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate } from "@/lib/format";
import {
  BoxIcon,
  ChartIcon,
  UserIcon,
  TagIcon,
  ArrowIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const [orders, paidOrders, products, users, lowStock, recentOrders, pendingReviews, todayOrders] =
    await Promise.all([
      db.order.count(),
      db.order.aggregate({ _sum: { total: true }, where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
      db.product.count(),
      db.user.count({ where: { role: "USER" } }),
      db.product.findMany({ where: { stock: { lte: 3 }, active: true }, take: 5, orderBy: { stock: "asc" } }),
      db.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      db.review.count({ where: { status: "PENDING" } }),
      db.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

  const revenue = paidOrders._sum.total ?? 0;
  const avg = revenue / (orders || 1);

  const stats = [
    { label: "سفارش‌های امروز", value: toFa(todayOrders), icon: ChartIcon, color: "bg-indigo-50 text-indigo-600" },
    { label: "کل سفارش‌ها", value: toFa(orders), icon: ChartIcon, color: "bg-blue-50 text-blue-600" },
    { label: "فروش (تومان)", value: toFa(Math.round(revenue).toLocaleString("en-US")), icon: TagIcon, color: "bg-emerald-50 text-emerald-600" },
    { label: "محصولات", value: toFa(products), icon: BoxIcon, color: "bg-violet-50 text-violet-600" },
    { label: "کاربران", value: toFa(users), icon: UserIcon, color: "bg-amber-50 text-amber-600" },
    { label: "میانگین هر سفارش", value: toFa(Math.round(avg).toLocaleString("en-US")), icon: ChartIcon, color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">داشبورد</h1>
        {pendingReviews > 0 && (
          <Link
            href="/admin/reviews"
            className="bg-amber-100 text-amber-800 text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-200 transition"
          >
            {toFa(pendingReviews)} نظر در انتظار تأیید
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div className="text-lg font-black text-slate-800 leading-7">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800">آخرین سفارش‌ها</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800">
              همه <ArrowIcon className="w-4 h-4 rotate-180" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-8">هنوز سفارشی ثبت نشده است</div>
            )}
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-slate-100"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800">#{toFa(o.orderNumber)} — {o.customerName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatDate(o.createdAt)} · {toFa(o.items.reduce((s, i) => s + i.quantity, 0))} کالا
                  </div>
                </div>
                <div className="text-sm font-extrabold text-indigo-700">{toToman(o.total)}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-4">هشدار موجودی</h2>
          {lowStock.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">همه محصولات موجودی کافی دارند</div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition"
                >
                  <span className="text-sm font-bold text-slate-700 line-clamp-1">{p.name}</span>
                  <span className={`text-xs font-black shrink-0 ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.stock === 0 ? "ناموجود" : `${toFa(p.stock)} عدد`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

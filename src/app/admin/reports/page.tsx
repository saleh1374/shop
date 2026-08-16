import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate, orderStatusLabel } from "@/lib/format";
import { MoneyIcon, ChartIcon, BoxIcon, UserIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdmin();

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 13);

  const [orders, daily, topProducts, statusCounts, monthly, topCustomers] = await Promise.all([
    db.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, total: true, status: true } }),
    db.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }),
    db.orderItem.groupBy({
      by: ["productId"],
      where: { order: { status: { not: "CANCELLED" } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) } },
      select: { createdAt: true, total: true },
    }),
    db.order.groupBy({
      by: ["userId"],
      where: { status: { not: "CANCELLED" }, userId: { not: null } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ]);

  const customerIds = topCustomers.map((c) => c.userId).filter(Boolean) as string[];
  const customers = customerIds.length
    ? await db.user.findMany({ where: { id: { in: customerIds } }, select: { id: true, name: true, email: true } })
    : [];
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const productIds = topProducts.map((p) => p.productId).filter(Boolean) as string[];
  const products = productIds.length
    ? await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, slug: true, price: true, salePrice: true },
      })
    : [];
  const productMap = new Map(products.map((p) => [p.id, p]));

  const dayMap = new Map<string, { count: number; total: number }>();
  for (const o of daily) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(key) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += o.total;
    dayMap.set(key, entry);
  }
  const days: { label: string; count: number; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    days.push({
      label: formatDate(d),
      count: entry?.count ?? 0,
      total: entry?.total ?? 0,
    });
  }

  const totalOrders = orders.length;
  const revenue = daily.reduce((s, o) => s + o.total, 0);
  const avgCart = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;
  const maxTotal = Math.max(...days.map((d) => d.total), 1);

  const monthMap = new Map<string, number>();
  for (const o of monthly) {
    const key = o.createdAt.toISOString().slice(0, 7);
    monthMap.set(key, (monthMap.get(key) ?? 0) + o.total);
  }
  const months: { label: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    months.push({
      label: new Intl.DateTimeFormat("fa-IR", { month: "short", year: "numeric" }).format(d),
      total: monthMap.get(key) ?? 0,
    });
  }
  const maxMonth = Math.max(...months.map((m) => m.total), 1);

  const statusTotal = statusCounts.reduce((s, c) => s + c._count, 0);
  const statusOrder = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  const barColors: Record<string, string> = {
    PENDING: "bg-amber-400",
    PAID: "bg-indigo-500",
    SHIPPED: "bg-blue-500",
    DELIVERED: "bg-emerald-500",
    CANCELLED: "bg-red-400",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
        <MoneyIcon className="w-7 h-7 text-indigo-600" /> گزارش فروش
        <span className="text-sm font-bold text-slate-400">(۱۴ روز اخیر)</span>
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs text-slate-400 font-bold">فروش ۱۴ روز اخیر</div>
          <div className="text-xl font-black text-indigo-700 mt-2">{toToman(revenue)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs text-slate-400 font-bold">تعداد سفارش‌ها</div>
          <div className="text-xl font-black text-slate-800 mt-2">{toFa(totalOrders)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-xs text-slate-400 font-bold">میانگین سبد خرید</div>
          <div className="text-xl font-black text-slate-800 mt-2">{toToman(avgCart)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-indigo-600" /> فروش ۱۲ ماه اخیر
        </h2>
        <div className="flex items-end gap-1.5 h-36">
          {months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group">
              <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                {m.total > 0 ? toToman(m.total) : ""}
              </div>
              <div
                className={`w-full rounded-t-lg transition-all ${m.total > 0 ? "bg-gradient-to-t from-indigo-600 to-violet-400" : "bg-slate-100"}`}
                style={{ height: `${Math.max((m.total / maxMonth) * 100, m.total > 0 ? 4 : 2)}%` }}
              />
              <div className="text-[10px] text-slate-400 truncate w-full text-center">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-indigo-600" /> فروش روزانه
        </h2>
        <div className="space-y-2">
          {days.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="w-28 text-xs text-slate-500 shrink-0">{d.label}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all ${d.total > 0 ? "bg-gradient-to-l from-indigo-500 to-violet-500" : "bg-transparent"}`}
                  style={{ width: `${Math.max((d.total / maxTotal) * 100, d.total > 0 ? 6 : 0)}%` }}
                />
                <span className="absolute inset-0 flex items-center pr-2 text-[10px] font-bold text-white drop-shadow">
                  {d.count > 0 ? `${toFa(d.count)} سفارش` : ""}
                </span>
              </div>
              <span className="w-24 text-xs font-bold text-slate-700 shrink-0 text-left">
                {d.total > 0 ? toToman(d.total) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <BoxIcon className="w-5 h-5 text-indigo-600" /> محصولات پرفروش
          </h2>
          {topProducts.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">داده‌ای موجود نیست</div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((t, i) => {
                const p = t.productId ? productMap.get(t.productId) : null;
                return (
                  <div key={t.productId ?? i} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center shrink-0">
                        {toFa(i + 1)}
                      </span>
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {p?.name ?? "محصول حذف‌شده"}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 shrink-0">
                      {toFa(t._sum.quantity ?? 0)} فروش
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-4">توزیع وضعیت سفارش‌ها</h2>
          <div className="space-y-3">
            {statusOrder.map((s) => {
              const count = statusCounts.find((c) => c.status === s)?._count ?? 0;
              const pct = statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0;
              const st = orderStatusLabel(s as never);
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-bold text-slate-700">{st.label}</span>
                    <span className="text-xs text-slate-400">
                      {toFa(count)} ({toFa(pct)}٪)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColors[s] ?? "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
          <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" /> مشتریان برتر
          </h2>
          {topCustomers.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">داده‌ای موجود نیست</div>
          ) : (
            <div className="space-y-2">
              {topCustomers.map((c, i) => {
                const cu = c.userId ? customerMap.get(c.userId) : null;
                return (
                  <div key={c.userId ?? i} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 text-xs font-black flex items-center justify-center shrink-0">
                        {toFa(i + 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-700 truncate">{cu?.name ?? "کاربر حذف‌شده"}</div>
                        {cu?.email && (
                          <div className="text-[11px] text-slate-400 truncate" dir="ltr">{cu.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-xs font-extrabold text-indigo-700">{toToman(c._sum.total ?? 0)}</div>
                      <div className="text-[10px] text-slate-400">{toFa(c._count)} سفارش</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
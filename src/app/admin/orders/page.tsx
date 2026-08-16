import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDateTime, orderStatusLabel } from "@/lib/format";
import OrdersCsvButton from "@/components/orders-csv-button";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["ALL", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status ?? "ALL";
  const q = sp.q;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 15;

  const where: Record<string, unknown> = {
    ...(status !== "ALL" ? { status } : {}),
    ...(q ? { OR: [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { customerPhone: { contains: q } }] } : {}),
  };

  const [total, orders, statusCounts, sumTotal] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const countMap = Object.fromEntries(statusCounts.map((c) => [c.status, c._count]));

  const link = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/admin/orders?${p.toString()}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-5">سفارش‌ها ({toFa(total)})</h1>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={link({ status: s })}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition ${
              status === s ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-400"
            }`}
          >
            {s === "ALL" ? "همه" : orderStatusLabel(s).label}
            <span className={`mr-1.5 text-xs ${status === s ? "text-indigo-100" : "text-slate-400"}`}>
              {toFa(s === "ALL" ? total : countMap[s] ?? 0)}
            </span>
          </Link>
        ))}
        <div className="mr-auto flex gap-2">
          <OrdersCsvButton orders={orders} />
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="شماره / نام / موبایل..."
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm w-56"
            />
            <button className="h-10 px-4 rounded-xl bg-slate-800 text-white text-sm font-bold">جستجو</button>
          </form>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 text-sm mb-4 flex items-center gap-4 flex-wrap">
        <span className="font-black text-indigo-700">
          مجموع سفارش‌های غیرلغو: {toToman(sumTotal._sum.total ?? 0)}
        </span>
        <span className="text-slate-500 font-bold">
          میانگین: {toToman(Math.round((sumTotal._sum.total ?? 0) / Math.max(total, 1)))}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="text-right p-4 font-bold">شماره</th>
              <th className="text-right p-4 font-bold">مشتری</th>
              <th className="text-right p-4 font-bold hidden md:table-cell">تاریخ</th>
              <th className="text-right p-4 font-bold">مبلغ</th>
              <th className="text-right p-4 font-bold">وضعیت</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const st = orderStatusLabel(o.status);
              return (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="p-4 font-bold text-indigo-700">#{toFa(o.orderNumber)}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{o.customerName}</div>
                    <div className="text-xs text-slate-400" dir="ltr">{o.customerPhone}</div>
                  </td>
                  <td className="p-4 text-slate-500 hidden md:table-cell">{formatDateTime(o.createdAt)}</td>
                  <td className="p-4 font-extrabold text-slate-800">{toToman(o.total)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.id}`} className="text-indigo-600 font-bold text-xs">
                      مدیریت
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center text-slate-400 text-sm py-12">سفارشی یافت نشد</div>}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={link({ page: String(n) })}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                n === page ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              {toFa(n)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

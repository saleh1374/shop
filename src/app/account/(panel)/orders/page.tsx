import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate, orderStatusLabel } from "@/lib/format";
import { BoxIcon, SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const tabs = [
  { key: "", label: "همه" },
  { key: "PENDING", label: "در انتظار پرداخت" },
  { key: "PAID", label: "پرداخت شده" },
  { key: "SHIPPED", label: "ارسال شده" },
  { key: "DELIVERED", label: "تحویل شده" },
  { key: "CANCELLED", label: "لغو شده" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await requireUser();
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = (sp.q ?? "").trim();

  const where = {
    userId: session.id,
    ...(status && ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)
      ? { status: status as "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
      : {}),
    ...(q ? { orderNumber: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    db.order.groupBy({
      by: ["status"],
      where: { userId: session.id },
      _count: true,
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const totalCount = counts.reduce((a, c) => a + c._count, 0);

  const mkHref = (s: string) =>
    `/account/orders?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}) }).toString()}`;

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <BoxIcon className="w-7 h-7 text-indigo-600" /> سفارش‌های من
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const active = (t.key === "" && !status) || t.key === status;
            const count = t.key === "" ? totalCount : countMap[t.key as keyof typeof countMap] ?? 0;
            return (
              <Link
                key={t.key || "all"}
                href={mkHref(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                  active ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.label}
                <span className={`mr-1.5 text-xs ${active ? "text-indigo-100" : "text-slate-400"}`}>
                  {toFa(count)}
                </span>
              </Link>
            );
          })}
        </div>
        <form className="flex gap-2 sm:mr-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجوی شماره سفارش..."
            className="h-10 w-full sm:w-52 rounded-xl border border-slate-200 px-3 text-sm bg-white"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shrink-0"
            aria-label="جستجو"
          >
            <SearchIcon className="w-4 h-4" />
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">سفارشی یافت نشد</p>
          <Link
            href="/products"
            className="inline-block mt-4 bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
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
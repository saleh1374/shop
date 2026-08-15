import Link from "next/link";
import { requireAdmin, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate } from "@/lib/format";
import UserActions from "@/components/user-actions";
import { UsersIcon, SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requireAdmin();
  const me = await getSession();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const roleFilter = sp.role === "ADMIN" ? "ADMIN" : sp.role === "USER" ? "USER" : "";

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(roleFilter ? { role: roleFilter as "USER" | "ADMIN" } : {}),
  };

  const users = await db.user.findMany({
    where,
    include: {
      _count: { select: { orders: true } },
      orders: { where: { status: { not: "CANCELLED" } }, select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mkHref = (r: string) =>
    `/admin/users?${new URLSearchParams({ ...(r ? { role: r } : {}), ...(q ? { q } : {}) }).toString()}`;

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
        <UsersIcon className="w-7 h-7 text-indigo-600" /> کاربران ({toFa(users.length)})
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { key: "", label: "همه" },
            { key: "USER", label: "کاربران" },
            { key: "ADMIN", label: "مدیران" },
          ].map((t) => {
            const active = (t.key === "" && !roleFilter) || t.key === roleFilter;
            return (
              <Link
                key={t.key || "all"}
                href={mkHref(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                  active ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
        <form className="flex gap-2 sm:mr-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجوی نام، ایمیل یا موبایل..."
            className="h-10 w-full sm:w-64 rounded-xl border border-slate-200 px-3 text-sm bg-white"
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="text-right p-4 font-bold">کاربر</th>
              <th className="text-right p-4 font-bold hidden md:table-cell">موبایل</th>
              <th className="text-right p-4 font-bold">نقش</th>
              <th className="text-right p-4 font-bold hidden sm:table-cell">عضویت</th>
              <th className="text-right p-4 font-bold hidden sm:table-cell">سفارش‌ها</th>
              <th className="text-right p-4 font-bold hidden lg:table-cell">مجموع خرید</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const totalSpent = u.orders.reduce((s, o) => s + o.total, 0);
              const isMe = u.id === me?.id;
              return (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                        {u.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {u.name}
                          {isMe && <span className="mr-1.5 text-[10px] text-indigo-500 font-bold">(من)</span>}
                        </div>
                        <div className="text-xs text-slate-400 truncate" dir="ltr">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 hidden md:table-cell" dir="ltr">{u.phone ?? "—"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        u.role === "ADMIN" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.role === "ADMIN" ? "مدیر" : "کاربر"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                  <td className="p-4 font-bold text-slate-700 hidden sm:table-cell">{toFa(u._count.orders)}</td>
                  <td className="p-4 font-extrabold text-indigo-700 hidden lg:table-cell">
                    {toToman(totalSpent)}
                  </td>
                  <td className="p-4">
                    {isMe ? (
                      <span className="text-[11px] text-slate-400">شما</span>
                    ) : (
                      <UserActions userId={u.id} role={u.role} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-12">کاربری یافت نشد</div>
        )}
      </div>
    </div>
  );
}
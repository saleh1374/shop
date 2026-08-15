import Link from "next/link";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate, orderStatusLabel } from "@/lib/format";
import {
  BoxIcon,
  HeartIcon,
  MoneyIcon,
  CommentIcon,
  ChevronIcon,
  MapPinIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AccountDashboard() {
  const session = await requireUser();
  const user = await getCurrentUser();

  const [orders, totalOrders, totalSpent, wishlistCount, reviewCount] = await Promise.all([
    db.order.findMany({
      where: { userId: session.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.order.count({ where: { userId: session.id } }),
    db.order.aggregate({
      where: { userId: session.id, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    db.wishlistItem.count({ where: { userId: session.id } }),
    db.review.count({ where: { userId: session.id } }),
  ]);

  const stats = [
    { label: "کل سفارش‌ها", value: toFa(totalOrders), icon: BoxIcon, color: "bg-indigo-50 text-indigo-600" },
    { label: "مجموع خرید", value: toToman(totalSpent._sum.total ?? 0), icon: MoneyIcon, color: "bg-emerald-50 text-emerald-600" },
    { label: "علاقه‌مندی‌ها", value: toFa(wishlistCount), icon: HeartIcon, color: "bg-rose-50 text-rose-600" },
    { label: "نظرات", value: toFa(reviewCount), icon: CommentIcon, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-l from-indigo-600 to-violet-600 rounded-3xl p-6 text-white">
        <h1 className="text-xl font-black">سلام {user?.name} 👋</h1>
        <p className="text-sm text-indigo-100 mt-1.5">
          به حساب کاربری خود خوش آمدید. از اینجا سفارش‌ها، علاقه‌مندی‌ها و آدرس‌های خود را مدیریت کنید.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            href="/products"
            className="bg-white text-indigo-700 text-sm font-extrabold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition"
          >
            شروع خرید
          </Link>
          <Link
            href="/account/wishlist"
            className="bg-white/15 text-white text-sm font-extrabold px-5 py-2.5 rounded-xl hover:bg-white/25 transition"
          >
            علاقه‌مندی‌ها
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="bg-white/15 text-white text-sm font-extrabold px-5 py-2.5 rounded-xl hover:bg-white/25 transition"
            >
              پنل مدیریت
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div className="text-lg font-black text-slate-800 mt-3">{s.value}</div>
            <div className="text-xs text-slate-400 font-bold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <BoxIcon className="w-5 h-5 text-indigo-600" /> سفارش‌های اخیر
          </h2>
          <Link href="/account/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            مشاهده همه
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            هنوز سفارشی ثبت نکرده‌اید.
            <Link href="/products" className="block mt-2 text-indigo-600 font-bold">
              اولین خرید خود را انجام دهید
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.map((o) => {
              const st = orderStatusLabel(o.status);
              return (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition group"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-800">سفارش #{toFa(o.orderNumber)}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(o.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-extrabold text-indigo-700 hidden sm:block">
                      {toToman(o.total)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.color}`}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/addresses"
          className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:border-indigo-300 transition"
        >
          <span className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MapPinIcon className="w-5 h-5" />
          </span>
          <div>
            <div className="font-black text-slate-800 text-sm">مدیریت آدرس‌ها</div>
            <div className="text-xs text-slate-400 mt-0.5">افزودن و ویرایش آدرس‌های تحویل</div>
          </div>
        </Link>
        <Link
          href="/account/profile"
          className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:border-indigo-300 transition"
        >
          <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ChevronIcon className="w-5 h-5" />
          </span>
          <div>
            <div className="font-black text-slate-800 text-sm">تنظیمات پروفایل</div>
            <div className="text-xs text-slate-400 mt-0.5">ویرایش اطلاعات و تغییر رمز عبور</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
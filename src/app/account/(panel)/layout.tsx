import Link from "next/link";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/app/actions";
import { db } from "@/lib/db";
import AccountNav from "@/components/account-nav";
import { LogoutIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const user = await getCurrentUser();
  const wishlistCount = await db.wishlistItem.count({ where: { userId: session.id } });
  const initial = (user?.name ?? "کاربر").charAt(0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <span className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                {initial}
              </span>
              <div className="min-w-0">
                <div className="font-black text-slate-800 truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate" dir="ltr">{user?.email}</div>
              </div>
            </div>

            <AccountNav wishlistCount={wishlistCount} />

            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex-1 text-center px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
                >
                  پنل مدیریت
                </Link>
              )}
              <form action={logoutUser} className="flex-1">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition"
                >
                  <LogoutIcon className="w-4 h-4" /> خروج
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
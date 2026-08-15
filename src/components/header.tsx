import Link from "next/link";
import { getSettings, setting } from "@/lib/settings";
import { getCartSession } from "@/lib/cart";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toFa } from "@/lib/format";
import SearchBox from "@/components/search-box";
import { CartIcon, UserIcon, MenuIcon } from "@/components/icons";

export default async function Header() {
  const [settings, session] = await Promise.all([getSettings(), getSession()]);
  const storeName = setting(settings, "store_name", "فروشگاه");
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  });

  const cartSession = await getCartSession();
  const cartCount = cartSession
    ? await db.cartItem.aggregate({
        _sum: { quantity: true },
        where: { sessionId: cartSession },
      })
    : null;
  const count = cartCount?._sum.quantity ?? 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
              {storeName.charAt(0)}
            </span>
            <span className="font-extrabold text-lg text-slate-800 hidden sm:block">
              {storeName}
            </span>
          </Link>

          <SearchBox />

          <div className="flex items-center gap-1 mr-auto">
            {session?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition"
              >
                پنل مدیریت
              </Link>
            )}
            <Link
              href={session ? "/account" : "/account/login"}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{session ? "حساب من" : "ورود / ثبت‌نام"}</span>
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              <CartIcon className="w-5 h-5" />
              <span className="hidden sm:inline">سبد خرید</span>
              {count > 0 && (
                <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                  {toFa(count)}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto py-2 text-sm">
          <Link
            href="/products"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 whitespace-nowrap transition"
          >
            <MenuIcon className="w-4 h-4" />
            همه محصولات
          </Link>
          {categories.map((c) => (
            <div key={c.id} className="group relative whitespace-nowrap">
              <Link
                href={`/products?category=${c.slug}`}
                className="px-3 py-1.5 rounded-lg font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition block"
              >
                {c.name}
              </Link>
              {c.children.length > 0 && (
                <div className="absolute right-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-lg py-2 min-w-52 z-50">
                  {c.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/products?category=${sub.slug}`}
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

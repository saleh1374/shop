import Link from "next/link";
import { db } from "@/lib/db";
import { toFa } from "@/lib/format";
import { ProductsGrid } from "@/components/products-grid";
import PriceFilter from "@/components/price-filter";
import { ChevronIcon, HomeIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const SORTS = [
  { id: "newest", label: "جدیدترین" },
  { id: "cheap", label: "ارزان‌ترین" },
  { id: "expensive", label: "گران‌ترین" },
  { id: "popular", label: "پربازدیدترین" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const category = sp.category;
  const q = sp.q;
  const sort = sp.sort ?? "newest";
  const min = sp.min;
  const max = sp.max;

  const [categories, parents] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, include: { children: { orderBy: { name: "asc" } } } }),
    db.category.findMany({ where: { parentId: null }, select: { id: true } }),
  ]);
  const parentIds = new Set(parents.map((p) => p.id));

  const link = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/products?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* مسیر */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
          <HomeIcon className="w-4 h-4" /> خانه
        </Link>
        <ChevronIcon className="w-3 h-3 rotate-180" />
        <span className="font-bold text-slate-700">محصولات</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* فیلترها */}
        <aside className="lg:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:sticky lg:top-24 space-y-5">
            {q && (
              <div>
                <div className="text-xs text-slate-400 mb-1">جستجو برای:</div>
                <div className="flex items-center justify-between gap-2 bg-indigo-50 text-indigo-700 rounded-xl px-3 py-2 text-sm font-bold">
                  <span className="truncate">«{q}»</span>
                  <Link href="/products" className="text-indigo-400 hover:text-indigo-600 text-xs shrink-0">
                    حذف
                  </Link>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">دسته‌بندی</h3>
              <Link
                href="/products"
                className={`block text-sm py-1.5 rounded-lg px-2 transition ${
                  !category ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                همه
              </Link>
              {categories.map((c) => (
                <div key={c.id}>
                  <Link
                    href={link({ category: c.slug })}
                    className={`block text-sm py-1.5 rounded-lg px-2 transition ${
                      category === c.slug ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {c.name}
                  </Link>
                  {!parentIds.has(c.id) &&
                    c.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={link({ category: sub.slug })}
                        className={`block text-xs py-1 pr-6 rounded-lg transition ${
                          category === sub.slug
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">قیمت (تومان)</h3>
              <PriceFilter category={category} q={q} />
            </div>
          </div>
        </aside>

        {/* محصولات */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-500">
              مرتب‌سازی بر اساس
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SORTS.map((s) => (
                <Link
                  key={s.id}
                  href={link({ sort: s.id })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                    sort === s.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-400"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <ProductsGrid
            category={category}
            q={q}
            sort={sort as "newest" | "cheap" | "expensive" | "popular"}
            min={min}
            max={max}
            page={sp.page}
          />

          {categories.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              محصولی یافت نشد
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

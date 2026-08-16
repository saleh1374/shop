import Link from "next/link";
import { db } from "@/lib/db";
import { toFa } from "@/lib/format";
import { ProductsGrid } from "@/components/products-grid";
import ProductsSidebar from "@/components/products-sidebar";
import MobileFilterDrawer from "@/components/mobile-filter-drawer";
import ActiveFilters from "@/components/active-filters";
import { ChevronIcon, HomeIcon, GridIcon, ListIcon } from "@/components/icons";

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
  const view = sp.view ?? "grid";

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: { products: { select: { id: true } } },
      },
      products: { select: { id: true } },
    },
  });

  const link = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    if (sort && sort !== "newest") p.set("sort", sort);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/products?${p.toString()}`;
  };

  // فیلترهای فعال
  const activeFilters: { key: string; label: string; value: string }[] = [];
  if (q) activeFilters.push({ key: "q", label: "جستجو", value: q });
  if (category) {
    const cat = categories.find((c) => c.slug === category);
    activeFilters.push({ key: "category", label: "دسته", value: cat?.name ?? category });
  }
  if (min) activeFilters.push({ key: "min", label: "حداقل قیمت", value: min });
  if (max) activeFilters.push({ key: "max", label: "حداکثر قیمت", value: max });

  const totalProducts = categories
    .filter((c) => !c.parentId)
    .reduce((sum, c) => sum + c.products.length + c.children.reduce((s, ch) => s + ch.products.length, 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* مسیر */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-indigo-600 flex items-center gap-1">
          <HomeIcon className="w-4 h-4" /> خانه
        </Link>
        <ChevronIcon className="w-3 h-3 rotate-180" />
        <span className="font-bold text-slate-700">محصولات</span>
        {category && (
          <>
            <ChevronIcon className="w-3 h-3 rotate-180" />
            <span className="text-slate-600">{categories.find((c) => c.slug === category)?.name}</span>
          </>
        )}
      </nav>

      {/* هدر صفحه */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          {category ? categories.find((c) => c.slug === category)?.name : "همه محصولات"}
        </h1>
        <p className="text-sm text-slate-500">{toFa(totalProducts)} محصول</p>
      </div>

      {/* فیلترهای فعال */}
      <ActiveFilters
        filters={activeFilters}
        category={category}
        q={q}
        sort={sort}
        min={min}
        max={max}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* فیلترهای sidebar - دسکتاپ */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <ProductsSidebar categories={categories} category={category} q={q} min={min} max={max} />
        </aside>

        {/* محصولات */}
        <div className="flex-1 min-w-0">
          {/* نوار ابزار بالا */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              {/* دکمه فیلتر موبایل */}
              <MobileFilterDrawer
                categories={categories}
                category={category}
                q={q}
                min={min}
                max={max}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* تغییر نمایش */}
              <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <Link
                  href={link({ view: "grid" })}
                  className={`w-9 h-9 flex items-center justify-center transition ${
                    view === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="نمای شبکه‌ای"
                >
                  <GridIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={link({ view: "list" })}
                  className={`w-9 h-9 flex items-center justify-center transition ${
                    view === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="نمای لیستی"
                >
                  <ListIcon className="w-4 h-4" />
                </Link>
              </div>

              {/* مرتب‌سازی - dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-indigo-400 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13-6L16.5 15m0 0L12 10.5m4.5 4.5V3" />
                  </svg>
                  {SORTS.find((s) => s.id === sort)?.label}
                </button>
                <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30 min-w-[140px]">
                  {SORTS.map((s) => (
                    <Link
                      key={s.id}
                      href={link({ sort: s.id })}
                      className={`block px-4 py-2 text-sm transition ${
                        sort === s.id ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ProductsGrid
            category={category}
            q={q}
            sort={sort as "newest" | "cheap" | "expensive" | "popular"}
            min={min}
            max={max}
            page={sp.page}
            view={view as "grid" | "list"}
          />
        </div>
      </div>
    </div>
  );
}

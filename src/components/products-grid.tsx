import Link from "next/link";
import { db } from "@/lib/db";
import { toFa } from "@/lib/format";
import ProductCard from "@/components/product-card";
import { ChevronIcon } from "@/components/icons";

type SortKey = "newest" | "cheap" | "expensive" | "popular";

export async function ProductsGrid({
  category,
  q,
  sort,
  min,
  max,
  page,
  view = "grid",
}: {
  category?: string;
  q?: string;
  sort?: SortKey;
  min?: string;
  max?: string;
  page?: string;
  view?: string;
}) {
  const perPage = 12;
  const currentPage = Math.max(1, Number(page) || 1);
  const minPrice = min ? Number(min) : undefined;
  const maxPrice = max ? Number(max) : undefined;

  const categoryObj = category
    ? await db.category.findUnique({ where: { slug: category }, include: { parent: true } })
    : null;
  const categoryIds = categoryObj
    ? [categoryObj.id, ...(await db.category.findMany({ where: { parentId: categoryObj.id } })).map((c) => c.id)]
    : undefined;

  const where: Record<string, unknown> = {
    active: true,
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    ...(q
      ? { name: { contains: q, mode: "insensitive" as const } }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy =
    sort === "cheap"
      ? { price: "asc" as const }
      : sort === "expensive"
        ? { price: "desc" as const }
        : sort === "popular"
          ? { views: "desc" as const }
          : { createdAt: "desc" as const };

  const [total, rawProducts] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: {
        images: { select: { url: true }, orderBy: { sortOrder: "asc" } },
        reviews: { select: { rating: true }, where: { status: "APPROVED" } },
      },
      orderBy,
      skip: (currentPage - 1) * perPage,
      take: perPage,
    }),
  ]);

  const products = rawProducts.map((p) => ({
    ...p,
    _avg: { rating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : null },
    _count: { reviews: p.reviews.length },
  }));

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const param = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    if (sort) p.set("sort", sort);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    if (view && view !== "grid") p.set("view", view);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return p.toString();
  };

  return (
    <div>
      {categoryObj && (
        <div className="mb-4 text-sm text-slate-500">
          <Link href="/products" className="hover:text-indigo-600">همه محصولات</Link>
          {categoryObj.parent && (
            <>
              <span className="mx-1">/</span>
              <Link href={`/products?category=${categoryObj.parent.slug}`} className="hover:text-indigo-600">
                {categoryObj.parent.name}
              </Link>
            </>
          )}
          <span className="mx-1">/</span>
          <span className="text-slate-700 font-bold">{categoryObj.name}</span>
        </div>
      )}

      <div className="text-sm text-slate-500 mb-4">
        {toFa(total)} محصول یافت شد
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          محصولی مطابق جستجوی شما یافت نشد
        </div>
      ) : view === "list" ? (
        <div className="space-y-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} viewMode="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} viewMode="grid" />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link
              href={`/products?${param({ page: String(currentPage - 1) })}`}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-indigo-400 transition"
            >
              <ChevronIcon className="w-4 h-4 rotate-180" />
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
            .map((n, idx, arr) => (
              <span key={n} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== n - 1 && <span className="text-slate-400">…</span>}
                <Link
                  href={`/products?${param({ page: String(n) })}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition ${
                    n === currentPage
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-400"
                  }`}
                >
                  {toFa(n)}
                </Link>
              </span>
            ))}
          {currentPage < totalPages && (
            <Link
              href={`/products?${param({ page: String(currentPage + 1) })}`}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-indigo-400 transition"
            >
              <ChevronIcon className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

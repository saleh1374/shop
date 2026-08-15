import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman } from "@/lib/format";
import Image from "next/image";
import DeleteButton from "@/components/admin-delete-button";
import ProductFilters from "@/components/product-filters";
import { EditIcon, PlusIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string; status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q;
  const category = sp.category ?? "";
  const status = sp.status ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 15;

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(category ? { categoryId: category } : {}),
    ...(status === "active"
      ? { active: true }
      : status === "inactive"
        ? { active: false }
        : {}),
  };
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { images: { select: { url: true }, orderBy: { sortOrder: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / perPage));

  const mkHref = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (status) p.set("status", status);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/admin/products?${p.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-slate-800">محصولات ({toFa(total)})</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <ProductFilters q={q} category={category} status={status} categories={categories} />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
          >
            <PlusIcon className="w-4 h-4" /> محصول جدید
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="text-right p-4 font-bold">محصول</th>
              <th className="text-right p-4 font-bold hidden md:table-cell">دسته</th>
              <th className="text-right p-4 font-bold">قیمت</th>
              <th className="text-right p-4 font-bold">موجودی</th>
              <th className="text-right p-4 font-bold hidden sm:table-cell">وضعیت</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="p-4">
                  <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3">
                    <span className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />
                      )}
                    </span>
                    <span className="font-bold text-slate-800 line-clamp-2 hover:text-indigo-700">{p.name}</span>
                  </Link>
                </td>
                <td className="p-4 text-slate-500 hidden md:table-cell">{p.category?.name ?? "-"}</td>
                <td className="p-4 font-extrabold text-slate-800">
                  {toToman(p.salePrice && p.salePrice < p.price ? p.salePrice : p.price)}
                </td>
                <td className="p-4">
                  <span className={`font-bold ${p.stock === 0 ? "text-red-600" : p.stock <= 3 ? "text-amber-600" : "text-slate-700"}`}>
                    {toFa(p.stock)}
                  </span>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.active ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="ویرایش"
                    >
                      <EditIcon className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={p.id} action="product" name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-12">محصولی یافت نشد</div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={mkHref({ page: String(n) })}
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

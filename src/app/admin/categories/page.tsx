import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa } from "@/lib/format";
import CategoryForm from "@/components/category-form";
import DeleteButton from "@/components/admin-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { children: { include: { _count: { select: { products: true } } } }, _count: { select: { products: true } } },
  });
  const roots = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => c.parentId);

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-5">دسته‌بندی‌ها</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-4">افزودن دسته جدید</h2>
          <CategoryForm categories={categories} />
        </div>

        <div className="space-y-3">
          {roots.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {toFa(c._count.products)} محصول مستقیم · {toFa(c.children.length)} زیردسته
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CategoryForm categories={categories} category={c} compact />
                  <DeleteButton id={c.id} action="category" name={c.name} />
                </div>
              </div>
              {c.children.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 space-y-1">
                  {children
                    .filter((ch) => ch.parentId === c.id)
                    .map((ch) => (
                      <div key={ch.id} className="flex items-center justify-between py-1.5">
                        <div>
                          <span className="text-sm font-bold text-slate-700">{ch.name}</span>
                          <span className="text-xs text-slate-400 mr-2">{toFa(ch._count.products)} محصول</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CategoryForm categories={categories} category={ch} compact />
                          <DeleteButton id={ch.id} action="category" name={ch.name} />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              هنوز دسته‌ای ساخته نشده است
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

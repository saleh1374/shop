import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import ProductForm from "@/components/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-slate-500 hover:text-indigo-600 mb-4 inline-block">
        ← بازگشت به محصولات
      </Link>
      <h1 className="text-2xl font-black text-slate-800 mb-5">محصول جدید</h1>
      <ProductForm categories={categories} />
    </div>
  );
}

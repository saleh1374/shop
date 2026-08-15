"use client";

import { useRouter } from "next/navigation";

export default function ProductFilters({
  q,
  category,
  status,
  categories,
}: {
  q?: string;
  category: string;
  status: string;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();

  function navigate(extra: Record<string, string>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (status) p.set("status", status);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    router.push(`/admin/products?${p.toString()}`);
  }

  return (
    <form
      className="flex gap-2 flex-wrap"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({});
      }}
    >
      <input
        name="q"
        defaultValue={q}
        placeholder="جستجوی محصول..."
        className="h-10 rounded-xl border border-slate-200 px-3 text-sm w-40 sm:w-52"
      />
      <select
        name="category"
        defaultValue={category}
        onChange={(e) => navigate({ category: e.target.value })}
        className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white"
      >
        <option value="">همه دسته‌ها</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => navigate({ status: e.target.value })}
        className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white"
      >
        <option value="">همه وضعیت‌ها</option>
        <option value="active">فعال</option>
        <option value="inactive">غیرفعال</option>
      </select>
      <button className="h-10 px-4 rounded-xl bg-slate-800 text-white text-sm font-bold">جستجو</button>
    </form>
  );
}
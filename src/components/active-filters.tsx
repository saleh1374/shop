"use client";

import Link from "next/link";
import { XIcon } from "@/components/icons";

type Filter = {
  key: string;
  label: string;
  value: string;
};

export default function ActiveFilters({
  filters,
  category,
  q,
  sort,
  min,
  max,
}: {
  filters: Filter[];
  category?: string;
  q?: string;
  sort?: string;
  min?: string;
  max?: string;
}) {
  if (filters.length === 0) return null;

  const buildHref = (removeKey: string) => {
    const p = new URLSearchParams();
    if (category && removeKey !== "category") p.set("category", category);
    if (q && removeKey !== "q") p.set("q", q);
    if (sort && sort !== "newest" && removeKey !== "sort") p.set("sort", sort);
    if (min && removeKey !== "min") p.set("min", min);
    if (max && removeKey !== "max") p.set("max", max);
    return `/products?${p.toString()}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="text-xs text-slate-500 font-bold">فیلترهای فعال:</span>
      {filters.map((f) => (
        <Link
          key={f.key}
          href={buildHref(f.key)}
          className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
        >
          {f.label}: {f.value}
          <XIcon className="w-3.5 h-3.5" />
        </Link>
      ))}
      <Link
        href="/products"
        className="text-xs text-slate-500 hover:text-red-600 font-bold transition"
      >
        حذف همه
      </Link>
    </div>
  );
}

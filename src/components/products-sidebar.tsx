"use client";

import Link from "next/link";
import { useState } from "react";
import { toFa } from "@/lib/format";
import PriceFilter from "@/components/price-filter";
import { ChevronIcon, SearchIcon, XIcon } from "@/components/icons";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  products: { id: string }[];
  children: {
    id: string;
    name: string;
    slug: string;
    products: { id: string }[];
  }[];
};

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-bold text-slate-800 hover:text-indigo-600 transition"
      >
        {title}
        <ChevronIcon className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

export default function ProductsSidebar({
  categories,
  category,
  q,
  min,
  max,
}: {
  categories: Category[];
  category?: string;
  q?: string;
  min?: string;
  max?: string;
}) {
  const [searchCat, setSearchCat] = useState("");
  const filteredCategories = categories.filter((c) =>
    c.name.includes(searchCat)
  );
  const parents = filteredCategories.filter((c) => !c.parentId);
  const link = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/products?${p.toString()}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:sticky lg:top-24">
      {/* جستجوی دسته */}
      <CollapsibleSection title="دسته‌بندی" defaultOpen={true}>
        <div className="relative mb-2">
          <SearchIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchCat}
            onChange={(e) => setSearchCat(e.target.value)}
            placeholder="جستجوی دسته..."
            className="w-full h-9 rounded-lg border border-slate-200 pr-8 pl-2 text-xs"
          />
          {searchCat && (
            <button onClick={() => setSearchCat("")} className="absolute left-2 top-1/2 -translate-y-1/2">
              <XIcon className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          <Link
            href="/products"
            className={`flex items-center justify-between text-sm py-1.5 px-2 rounded-lg transition ${
              !category ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>همه</span>
          </Link>
          {parents.map((c) => {
            const totalProducts = c.products.length + c.children.reduce((s, ch) => s + ch.products.length, 0);
            const isActive = category === c.slug;
            const hasActiveChild = c.children.some((ch) => category === ch.slug);
            return (
              <div key={c.id}>
                <Link
                  href={link({ category: c.slug })}
                  className={`flex items-center justify-between text-sm py-1.5 px-2 rounded-lg transition ${
                    isActive || hasActiveChild
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{toFa(totalProducts)}</span>
                </Link>
                {c.children.length > 0 && (isActive || hasActiveChild || searchCat) && (
                  <div className="mr-3 border-r-2 border-slate-100 pr-2">
                    {c.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={link({ category: sub.slug })}
                        className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition ${
                          category === sub.slug
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <span>{sub.name}</span>
                        <span className="text-slate-400">{toFa(sub.products.length)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* فیلتر قیمت */}
      <CollapsibleSection title="محدوده قیمت" defaultOpen={true}>
        <PriceFilter category={category} q={q} min={min} max={max} />
      </CollapsibleSection>

      {/* لینک‌های سریع */}
      <CollapsibleSection title="دسترسی سریع" defaultOpen={false}>
        <div className="space-y-1">
          <Link href="/products?sort=cheap" className="block text-xs text-slate-600 hover:text-indigo-600 py-1 px-2 rounded hover:bg-slate-50 transition">
            ارزان‌ترین محصولات
          </Link>
          <Link href="/products?sort=popular" className="block text-xs text-slate-600 hover:text-indigo-600 py-1 px-2 rounded hover:bg-slate-50 transition">
            پربازدیدترین محصولات
          </Link>
          <Link href="/products?sort=newest" className="block text-xs text-slate-600 hover:text-indigo-600 py-1 px-2 rounded hover:bg-slate-50 transition">
            جدیدترین محصولات
          </Link>
        </div>
      </CollapsibleSection>
    </div>
  );
}

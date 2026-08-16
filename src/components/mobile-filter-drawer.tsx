"use client";

import { useState } from "react";
import { XIcon, SlidersIcon } from "@/components/icons";
import ProductsSidebar from "@/components/products-sidebar";

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

export default function MobileFilterDrawer({
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-indigo-400 transition"
      >
        <SlidersIcon className="w-4 h-4" />
        فیلترها
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
              <h3 className="font-black text-slate-800">فیلترها</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ProductsSidebar
                categories={categories}
                category={category}
                q={q}
                min={min}
                max={max}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

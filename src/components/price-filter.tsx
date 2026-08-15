"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PriceFilter({
  category,
  q,
}: {
  category?: string;
  q?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  function apply() {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    router.push(`/products?${p.toString()}`);
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder="از"
          type="number"
          min="0"
          className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm"
        />
        <input
          value={max}
          onChange={(e) => setMax(e.target.value)}
          placeholder="تا"
          type="number"
          min="0"
          className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm"
        />
      </div>
      <button
        onClick={apply}
        className="w-full mt-2 h-9 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
      >
        اعمال فیلتر قیمت
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PriceFilter({
  category,
  q,
  min: defaultMin,
  max: defaultMax,
}: {
  category?: string;
  q?: string;
  min?: string;
  max?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [min, setMin] = useState(defaultMin ?? params.get("min") ?? "");
  const [max, setMax] = useState(defaultMax ?? params.get("max") ?? "");

  function apply() {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    router.push(`/products?${p.toString()}`);
  }

  const presets = [
    { label: "زیر ۱ میلیون", min: "0", max: "1000000" },
    { label: "۱ تا ۵ میلیون", min: "1000000", max: "5000000" },
    { label: "۵ تا ۲۰ میلیون", min: "5000000", max: "20000000" },
    { label: "بالای ۲۰ میلیون", min: "20000000", max: "" },
  ];

  return (
    <div>
      {/* پیش‌فرض‌های قیمت */}
      <div className="space-y-1 mb-3">
        {presets.map((p) => {
          const isActive = min === p.min && max === p.max;
          return (
            <button
              key={p.label}
              onClick={() => { setMin(p.min); setMax(p.max); }}
              className={`w-full text-right text-xs py-1.5 px-2 rounded-lg transition ${
                isActive ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* ورودی دستی */}
      <div className="flex gap-2">
        <input
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder="از"
          type="number"
          min="0"
          className="w-full h-9 rounded-lg border border-slate-200 px-2 text-xs"
        />
        <input
          value={max}
          onChange={(e) => setMax(e.target.value)}
          placeholder="تا"
          type="number"
          min="0"
          className="w-full h-9 rounded-lg border border-slate-200 px-2 text-xs"
        />
      </div>
      <button
        onClick={apply}
        className="w-full mt-2 h-9 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
      >
        اعمال قیمت
      </button>
    </div>
  );
}

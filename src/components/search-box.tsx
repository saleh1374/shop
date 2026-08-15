"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} className="flex-1 max-w-xl mx-auto">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو در محصولات..."
          className="w-full h-10 pr-4 pl-10 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 transition"
        />
        <button
          type="submit"
          aria-label="جستجو"
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

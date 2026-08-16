"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCategory } from "@/app/admin/actions";
import { EditIcon } from "@/components/icons";

export default function CategoryForm({
  categories,
  category,
  compact = false,
}: {
  categories: { id: string; name: string; parentId: string | null }[];
  category?: { id: string; name: string; parentId: string | null };
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (category) form.set("id", category.id);
    startTransition(async () => {
      const res = await saveCategory(form);
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (compact) {
    if (!open) {
      return (
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
          title="ویرایش"
        >
          <EditIcon className="w-4 h-4" />
        </button>
      );
    }
    return (
      <form onSubmit={submit} className="flex gap-1.5 items-center">
        <input name="name" defaultValue={category?.name} required className="h-9 w-40 rounded-lg border border-slate-200 px-2 text-sm" />
        <button className="h-9 px-3 rounded-lg bg-indigo-600 text-white text-xs font-bold">ثبت</button>
        <button type="button" onClick={() => setOpen(false)} className="h-9 px-2 text-slate-400 text-xs">انصراف</button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">نام دسته *</label>
        <input
          name="name"
          required
          className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm"
          placeholder="مثال: کالای دیجیتال"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">دسته والد (اختیاری)</label>
        <select name="parentId" className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm bg-white">
          <option value="">بدون والد (دسته اصلی)</option>
          {categories.filter((c) => c.parentId === null).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {error && <div className="text-sm text-red-600 font-bold">{error}</div>}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {pending ? "..." : "ایجاد دسته"}
      </button>
    </form>
  );
}

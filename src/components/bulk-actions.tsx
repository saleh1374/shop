"use client";

import { useState, useTransition } from "react";
import { bulkDeleteProducts, bulkToggleProducts } from "@/app/admin/actions";

type Props = {
  selectedIds: string[];
  onClearSelection: () => void;
};

export default function BulkActions({ selectedIds, onClearSelection }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleBulkDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startTransition(async () => {
      const result = await bulkDeleteProducts(selectedIds);
      if (result?.error) {
        alert(result.error);
      }
      onClearSelection();
      setConfirmDelete(false);
    });
  };

  const handleBulkToggle = (active: boolean) => {
    startTransition(async () => {
      const result = await bulkToggleProducts(selectedIds, active);
      if (result?.error) {
        alert(result.error);
      }
      onClearSelection();
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-slate-500 font-bold">{selectedIds.length} انتخاب شده</span>
      <button
        onClick={() => handleBulkToggle(true)}
        disabled={isPending}
        className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition disabled:opacity-50"
      >
        فعال‌سازی
      </button>
      <button
        onClick={() => handleBulkToggle(false)}
        disabled={isPending}
        className="h-8 px-3 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition disabled:opacity-50"
      >
        غیرفعال‌سازی
      </button>
      <button
        onClick={handleBulkDelete}
        disabled={isPending}
        className={`h-8 px-3 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
          confirmDelete ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
        }`}
      >
        {confirmDelete ? "تأیید حذف" : "حذف"}
      </button>
      <button onClick={onClearSelection} className="h-8 px-3 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">
        لغو انتخاب
      </button>
    </div>
  );
}

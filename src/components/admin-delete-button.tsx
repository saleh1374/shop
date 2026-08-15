"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, deleteCategory, deleteDiscount, deleteReview } from "@/app/admin/actions";
import { TrashIcon } from "@/components/icons";

type Actions = "product" | "category" | "discount" | "review";

export default function DeleteButton({ id, action, name }: { id: string; action: Actions; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function del() {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    const fn =
      action === "product"
        ? () => deleteProduct(id)
        : action === "category"
          ? () => deleteCategory(id)
          : action === "discount"
            ? () => deleteDiscount(id)
            : () => deleteReview(id);
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <button
      onClick={del}
      disabled={pending}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
        confirm
          ? "bg-red-600 text-white w-auto px-2.5 text-xs font-bold"
          : "text-slate-500 hover:text-red-600 hover:bg-red-50"
      }`}
      title={confirm ? `حذف ${name}؟ (دوباره کلیک کنید)` : "حذف"}
    >
      {pending ? (
        <span className="text-xs">...</span>
      ) : (
        confirm ? `حذف ${name}؟` : <TrashIcon className="w-4 h-4" />
      )}
    </button>
  );
}

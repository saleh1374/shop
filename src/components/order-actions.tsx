"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder, reorder } from "@/app/actions";
import { BanIcon, RepeatIcon } from "@/components/icons";

export default function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const canCancel = status === "PENDING" || status === "PAID";

  function handleCancel() {
    if (!confirm("آیا از لغو این سفارش مطمئن هستید؟ موجودی کالاها به انبار بازگردانده می‌شود.")) return;
    setError("");
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleReorder() {
    setError("");
    startTransition(async () => {
      const res = await reorder(orderId);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleReorder}
          disabled={pending}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition disabled:opacity-60"
        >
          <RepeatIcon className="w-4 h-4" /> سفارش مجدد
        </button>
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition disabled:opacity-60"
          >
            <BanIcon className="w-4 h-4" /> لغو سفارش
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
    </div>
  );
}
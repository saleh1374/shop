"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyCartCoupon, clearCartCoupon } from "@/app/actions";
import { TagIcon, XIcon } from "@/components/icons";
import { toToman } from "@/lib/format";

export default function CartCoupon({
  initialCode,
  discountAmount,
  error,
}: {
  initialCode: string;
  discountAmount: number;
  error: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState(initialCode);
  const [msg, setMsg] = useState(error);

  function apply() {
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await applyCartCoupon(code.trim());
      if (res.ok) setMsg("");
      else setMsg(res.error ?? "کد تخفیف معتبر نیست");
      router.refresh();
    });
  }

  function clear() {
    startTransition(async () => {
      await clearCartCoupon();
      setCode("");
      setMsg("");
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-sm text-slate-800 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-indigo-600" /> کد تخفیف
        </h2>
        {initialCode && (
          <button
            type="button"
            onClick={clear}
            disabled={pending}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition"
          >
            <XIcon className="w-3.5 h-3.5" /> حذف
          </button>
        )}
      </div>

      {initialCode ? (
        <div className={`text-sm font-bold ${discountAmount > 0 ? "text-emerald-600" : "text-red-600"}`}>
          {discountAmount > 0
            ? `کد ${initialCode} اعمال شد: ${toToman(discountAmount)} تخفیف`
            : msg || "این کد روی سبد فعلی قابل اعمال نیست"}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد تخفیف خود را وارد کنید"
            className="flex-1 h-11 rounded-xl border border-slate-200 px-3 text-sm bg-white transition"
          />
          <button
            type="button"
            onClick={apply}
            disabled={pending}
            className="h-11 px-5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shrink-0 disabled:opacity-60"
          >
            اعمال
          </button>
        </div>
      )}
      {msg && !initialCode && <div className="text-sm text-red-600 mt-2">{msg}</div>}
    </div>
  );
}
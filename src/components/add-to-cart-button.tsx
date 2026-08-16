"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions";
import { CartIcon, CheckIcon } from "@/components/icons";

export default function AddToCartButton({
  productId,
  stock,
  compact = false,
}: {
  productId: string;
  stock: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const disabled = stock === 0 || pending;

  function handle() {
    startTransition(async () => {
      const res = await addToCart(productId);
      if (res.ok) {
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
      router.refresh();
    });
  }

  return (
    <button
      onClick={handle}
      disabled={disabled}
      className={`rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
        compact ? "h-9 px-3 text-xs" : "w-full h-12"
      } ${
        disabled
          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
          : done
            ? "bg-emerald-600 text-white"
            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
      }`}
    >
      {done ? (
        <>
          <CheckIcon className="w-4 h-4" /> اضافه شد
        </>
      ) : (
        <>
          <CartIcon className="w-4 h-4" />
          {stock === 0 ? "ناموجود" : pending ? "..." : compact ? "افزودن به سبد" : "افزودن به سبد خرید"}
        </>
      )}
    </button>
  );
}

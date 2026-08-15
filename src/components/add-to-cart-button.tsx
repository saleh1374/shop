"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions";
import { CartIcon, CheckIcon } from "@/components/icons";
import { toFa } from "@/lib/format";

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
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
      className={`w-full h-12 rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
        disabled
          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
          : done
            ? "bg-emerald-600 text-white"
            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
      }`}
    >
      {done ? (
        <>
          <CheckIcon className="w-5 h-5" /> به سبد اضافه شد
        </>
      ) : (
        <>
          <CartIcon className="w-5 h-5" />
          {stock === 0 ? "ناموجود" : pending ? "در حال افزودن..." : "افزودن به سبد خرید"}
        </>
      )}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/actions";
import { HeartIcon } from "@/components/icons";

export default function WishlistButton({
  productId,
  isWishlisted,
  variant = "card",
}: {
  productId: string;
  isWishlisted: boolean;
  variant?: "card" | "page";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(isWishlisted);

  function handle(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (res.ok) {
        setActive((a) => !a);
        router.refresh();
      }
    });
  }

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        aria-label="حذف از علاقه‌مندی‌ها"
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:scale-110 transition disabled:opacity-50"
      >
        <HeartIcon className={`w-5 h-5 ${active ? "text-rose-600 fill-rose-600" : "text-rose-500"}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className={`flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border-2 text-sm font-bold transition disabled:opacity-50 ${
        active
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
      }`}
    >
      <HeartIcon className={`w-5 h-5 ${active ? "fill-rose-600 text-rose-600" : ""}`} />
      {active ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
    </button>
  );
}
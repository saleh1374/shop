"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { updateCartItem, removeCartItem } from "@/app/actions";
import { TrashIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { toFa, toToman } from "@/lib/format";

type Item = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    stock: number;
    images: { url: string }[];
  };
};

export default function CartItems({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok?: boolean; error?: string }>, refresh = true) {
    startTransition(async () => {
      await fn();
      if (refresh) router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const price = item.product.salePrice && item.product.salePrice > 0
          ? item.product.salePrice
          : item.product.price;
        const image = item.product.images[0]?.url;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-3"
          >
            <Link
              href={`/products/${item.product.slug}`}
              className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0"
            >
              {image ? (
                <Image src={image} alt={item.product.name} fill sizes="80px" className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-slate-300 text-xs">-</span>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product.slug}`}
                className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-indigo-700 transition"
              >
                {item.product.name}
              </Link>
              <div className="text-xs text-slate-400 mt-1">
                {toToman(price)} × {toFa(item.quantity)}
              </div>
              <div className="text-sm font-extrabold text-indigo-700 mt-1">
                {toToman(price * item.quantity)}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => run(() => updateCartItem(item.id, item.quantity + 1))}
                  disabled={pending || item.quantity >= item.product.stock}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-indigo-600 disabled:opacity-40 transition"
                  aria-label="افزایش"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-800">
                  {toFa(item.quantity)}
                </span>
                <button
                  onClick={() => run(() => updateCartItem(item.id, item.quantity - 1))}
                  disabled={pending}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-indigo-600 disabled:opacity-40 transition"
                  aria-label="کاهش"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => run(() => removeCartItem(item.id))}
                disabled={pending}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
              >
                <TrashIcon className="w-4 h-4" /> حذف
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

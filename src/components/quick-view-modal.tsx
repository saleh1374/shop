"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toFa, toToman } from "@/lib/format";
import { cartItemPrice } from "@/lib/price";
import { XIcon, StarIcon, CartIcon, ChevronIcon, CheckIcon } from "@/components/icons";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  description?: string | null;
  images: { url: string }[];
  category?: { name: string; slug: string } | null;
  _avg?: { rating: number | null };
  _count?: { reviews: number };
};

export default function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const price = cartItemPrice(product);
  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const avgRating = product._avg?.rating ?? 0;
  const reviewCount = product._count?.reviews ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* دکمه بستن */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* گالری تصاویر */}
          <div className="relative aspect-square bg-slate-50 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden">
            {product.images.length > 0 ? (
              <Image
                src={product.images[currentIdx].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">بدون تصویر</div>
            )}

            {/* thumbnails */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition ${
                      i === currentIdx ? "border-indigo-600" : "border-white/80"
                    }`}
                  >
                    <Image src={img.url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {hasSale && (
              <span className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-xl">
                {toFa(Math.round(((product.price - price) / product.price) * 100))}٪ تخفیف
              </span>
            )}
          </div>

          {/* اطلاعات محصول */}
          <div className="p-6 flex flex-col">
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                onClick={onClose}
                className="text-xs text-indigo-600 font-bold hover:underline mb-2"
              >
                {product.category.name}
              </Link>
            )}

            <h2 className="text-xl font-black text-slate-900 mb-2">{product.name}</h2>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-amber-400" dir="ltr">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <StarIcon key={n} className={`w-4 h-4 ${n <= Math.round(avgRating) ? "fill-current" : "text-slate-200"}`} />
                  ))}
                </div>
                <span className="text-sm text-slate-500">
                  {toFa(avgRating.toFixed(1))} ({toFa(reviewCount)} نظر)
                </span>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex items-end gap-3">
                <div className="text-2xl font-black text-indigo-700">{toToman(price)}</div>
                {hasSale && (
                  <>
                    <div className="text-sm text-slate-400 line-through mb-1">{toToman(product.price)}</div>
                    <span className="mb-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-lg">
                      صرفه‌جویی {toToman(product.price - price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-slate-500 leading-7 mb-4 line-clamp-3">{product.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm mb-4">
              {product.stock > 0 ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckIcon className="w-4 h-4" /> موجود ({toFa(product.stock)} عدد)
                </span>
              ) : (
                <span className="text-red-600 font-bold">ناموجود</span>
              )}
            </div>

            {/* انتخاب تعداد */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-slate-600 font-bold">تعداد:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
                  >
                    -
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-bold border-x border-slate-200">
                    {toFa(qty)}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto flex gap-2">
              <button
                disabled={product.stock === 0}
                className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CartIcon className="w-5 h-5" />
                افزودن به سبد
              </button>
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="h-12 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm flex items-center gap-1.5 hover:border-indigo-400 hover:text-indigo-600 transition"
              >
                مشاهده کامل
                <ChevronIcon className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

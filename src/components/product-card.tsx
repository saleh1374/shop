"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toFa, toToman } from "@/lib/format";
import { cartItemPrice } from "@/lib/price";
import { addToCart } from "@/app/actions";
import { HeartIcon, EyeIcon, StarIcon, CartIcon } from "@/components/icons";

type ProductForCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  views?: number;
  images: { url: string }[];
  _avg?: { rating: number | null };
  _count?: { reviews: number };
};

export default function ProductCard({
  product,
  viewMode = "grid",
  onQuickView,
}: {
  product: ProductForCard;
  viewMode?: "grid" | "list";
  onQuickView?: (product: ProductForCard) => void;
}) {
  const price = cartItemPrice(product);
  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const images = product.images;
  const [hovered, setHovered] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const currentImage = hovered && images.length > 1 ? images[1].url : images[0]?.url;
  const avgRating = product._avg?.rating ?? 0;
  const reviewCount = product._count?.reviews ?? 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await addToCart(product.id, 1);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  if (viewMode === "list") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-row"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative w-48 h-48 shrink-0 bg-slate-50 overflow-hidden">
          {currentImage ? (
            <Image src={currentImage} alt={product.name} fill sizes="192px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">بدون تصویر</div>
          )}
          {hasSale && (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
              {toFa(Math.round(((product.price - price) / product.price) * 100))}٪
            </span>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{product.name}</h3>
          {avgRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex text-amber-400" dir="ltr">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} className={`w-3.5 h-3.5 ${n <= Math.round(avgRating) ? "fill-current" : "text-slate-200"}`} />
                ))}
              </div>
              <span className="text-xs text-slate-400">({toFa(reviewCount)})</span>
            </div>
          )}
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              {hasSale && <div className="text-xs text-slate-400 line-through">{toToman(product.price)}</div>}
              <div className="text-lg font-extrabold text-indigo-700">{toToman(price)}</div>
            </div>
            {product.stock === 0 && <span className="text-xs text-red-600 font-bold">ناموجود</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* دکمه‌های روی تصویر */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
          className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white transition"
          aria-label="مشاهده سریع"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => e.preventDefault()}
          className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-white transition"
          aria-label="افزودن به علاقه‌مندی"
        >
          <HeartIcon className="w-4 h-4" />
        </button>
      </div>

      {/* بج تخفیف و ناموجود */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {hasSale && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
            {toFa(Math.round(((product.price - price) / product.price) * 100))}٪ تخفیف
          </span>
        )}
        {product.stock === 0 && (
          <span className="bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">ناموجود</span>
        )}
      </div>

      {/* تصویر */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square bg-slate-50 overflow-hidden block">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">بدون تصویر</div>
        )}
        {/* دکمه افزودن به سبد */}
        {product.stock > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <button
              onClick={handleAddToCart}
              disabled={pending}
              className="w-full h-9 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-700 transition shadow-lg disabled:opacity-60"
            >
              <CartIcon className="w-4 h-4" />
              {pending ? "در حال افزودن..." : "افزودن به سبد"}
            </button>
          </div>
        )}
      </Link>

      {/* اطلاعات */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-6 min-h-10 hover:text-indigo-600 transition">
            {product.name}
          </h3>
        </Link>

        {avgRating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon key={n} className={`w-3.5 h-3.5 ${n <= Math.round(avgRating) ? "fill-current" : "text-slate-200"}`} />
              ))}
            </div>
            <span className="text-xs text-slate-400">({toFa(reviewCount)})</span>
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-slate-100">
          {hasSale && <div className="text-xs text-slate-400 line-through">{toToman(product.price)}</div>}
          <div className="text-base font-extrabold text-indigo-700">{toToman(price)}</div>
        </div>
      </div>
    </div>
  );
}

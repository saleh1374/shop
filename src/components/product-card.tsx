import Link from "next/link";
import Image from "next/image";
import { toFa, toToman } from "@/lib/format";
import { cartItemPrice } from "@/lib/cart";

type ProductForCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: { url: string }[];
};

export default function ProductCard({ product }: { product: ProductForCard }) {
  const price = cartItemPrice(product);
  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const image = product.images[0]?.url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
            بدون تصویر
          </div>
        )}
        {hasSale && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {toFa(Math.round(((product.price - price) / product.price) * 100))}٪ تخفیف
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded-lg">
            ناموجود
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-6 min-h-12">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          {hasSale && (
            <div className="text-xs text-slate-400 line-through">{toToman(product.price)}</div>
          )}
          <div className="text-base font-extrabold text-indigo-700">
            {toToman(price)}
          </div>
        </div>
      </div>
    </Link>
  );
}

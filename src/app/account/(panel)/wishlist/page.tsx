import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman } from "@/lib/format";
import { HeartIcon } from "@/components/icons";
import WishlistButton from "@/components/wishlist-button";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await requireUser();
  const items = await db.wishlistItem.findMany({
    where: { userId: session.id },
    include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <HeartIcon className="w-7 h-7 text-rose-500" /> علاقه‌مندی‌ها
        </h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">لیست علاقه‌مندی‌های شما خالی است</p>
          <p className="text-xs text-slate-400 mt-2">
            روی قلب کنار هر محصول بزنید تا به این لیست اضافه شود
          </p>
          <Link
            href="/products"
            className="inline-block mt-5 bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <HeartIcon className="w-7 h-7 text-rose-500" /> علاقه‌مندی‌ها
        <span className="text-sm font-bold text-slate-400">{toFa(items.length)} کالا</span>
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const p = item.product;
          const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
          const img = p.images[0]?.url;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 hover:shadow-lg transition group"
            >
              <Link href={`/products/${p.slug}`} className="block relative">
                <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-slate-300 text-3xl">🖼</span>
                  )}
                </div>
                <span className="absolute top-2 right-2">
                  <WishlistButton productId={p.id} isWishlisted variant="card" />
                </span>
                {p.salePrice && p.salePrice > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                    {toFa(Math.round(((p.price - p.salePrice) / p.price) * 100))}٪
                  </span>
                )}
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <Link
                  href={`/products/${p.slug}`}
                  className="text-sm font-bold text-slate-700 line-clamp-2 min-h-10 hover:text-indigo-600"
                >
                  {p.name}
                </Link>
                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-slate-800">{toToman(price)}</span>
                  <AddToCartButton productId={p.id} stock={p.stock} compact />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
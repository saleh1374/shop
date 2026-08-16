import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { getSettings, setting } from "@/lib/settings";
import ProductGallery from "@/components/product-gallery";
import AddToCartButton from "@/components/add-to-cart-button";
import ReviewForm from "@/components/review-form";
import ProductCard from "@/components/product-card";
import WishlistButton from "@/components/wishlist-button";
import ShareButton from "@/components/share-button";
import JsonLd from "@/components/json-ld";
import ProductTabs from "@/components/product-tabs";
import ReviewBreakdown from "@/components/review-breakdown";
import { StarIcon, TruckIcon, ShieldIcon, ChevronIcon, CheckIcon, ClockIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {}
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true } },
    },
  });
  if (!product || !product.active) return {};
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
    keywords: [product.name, product.category?.name].filter(Boolean).join("، "),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {}
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { include: { parent: true } },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || !product.active) notFound();

  await db.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } });

  const session = await getSession();
  const s = await getSettings();
  const storeName = setting(s, "store_name", "فروشگاه");
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  const related = await db.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      images: { select: { url: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { reviews: true } },
    },
    take: 4,
  });

  const relatedWithAvg = related.map((p) => ({
    ...p,
    _avg: { rating: null as number | null },
    _count: { reviews: p._count.reviews },
  }));

  const purchased = session
    ? await db.orderItem.findFirst({
        where: {
          productId: product.id,
          order: { userId: session.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        },
      })
    : null;

  const isWishlisted = session
    ? !!(await db.wishlistItem.findUnique({
        where: { userId_productId: { userId: session.id, productId: product.id } },
      }))
    : false;

  const savings = hasSale ? product.price - price : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description ?? undefined,
          image: product.images[0]?.url,
          offers: {
            "@type": "Offer",
            priceCurrency: "IRR",
            price: price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
          brand: { "@type": "Brand", name: storeName },
          aggregateRating: avgRating > 0 ? {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: product.reviews.length,
          } : undefined,
        }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5 flex-wrap">
        <Link href="/" className="hover:text-indigo-600">خانه</Link>
        <ChevronIcon className="w-3 h-3 rotate-180" />
        <Link href="/products" className="hover:text-indigo-600">محصولات</Link>
        {product.category && (
          <>
            <ChevronIcon className="w-3 h-3 rotate-180" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-indigo-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronIcon className="w-3 h-3 rotate-180" />
        <span className="text-slate-700 font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 bg-white rounded-3xl border border-slate-200 p-5 sm:p-8">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          {/* Category */}
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs text-indigo-600 font-bold hover:text-indigo-800 mb-2 w-fit"
            >
              {product.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 leading-7">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex text-amber-400" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon
                  key={n}
                  className={`w-4 h-4 ${n <= Math.round(avgRating) ? "fill-current" : "text-slate-200"}`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {avgRating > 0 ? toFa(avgRating.toFixed(1)) : "بدون امتیاز"}
            </span>
            {product.reviews.length > 0 && (
              <a href="#reviews" className="text-sm text-indigo-600 hover:underline">
                ({toFa(product.reviews.length)} نظر)
              </a>
            )}
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-400">{toFa(product.views)} بازدید</span>
          </div>

          {/* Price card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 mb-5 border border-slate-200">
            <div className="flex items-end gap-3 mb-1">
              <div className="text-3xl font-black text-indigo-700">{toToman(price)}</div>
              {hasSale && (
                <div className="text-base text-slate-400 line-through mb-1">{toToman(product.price)}</div>
              )}
            </div>
            {hasSale && (
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                  {toFa(Math.round(((product.price - price) / product.price) * 100))}٪ تخفیف
                </span>
                <span className="text-sm text-emerald-600 font-bold">
                  صرفه‌جویی {toToman(savings)}
                </span>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-4 text-sm">
              {product.stock > 0 ? (
                <>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <CheckIcon className="w-4 h-4" /> موجود در انبار
                  </span>
                  <span className="text-slate-400">({toFa(product.stock)} عدد)</span>
                </>
              ) : (
                <span className="text-red-600 font-bold">ناموجود</span>
              )}
            </div>

            {product.stock > 0 && product.stock <= 5 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-2 font-bold">
                <ClockIcon className="w-3.5 h-3.5" />
                تنها {toFa(product.stock)} عدد باقی مانده
              </div>
            )}
          </div>

          {/* Add to cart */}
          <AddToCartButton productId={product.id} stock={product.stock} />

          {/* Wishlist + Share */}
          <div className="flex items-center gap-2 mt-3">
            {session && (
              <WishlistButton productId={product.id} isWishlisted={isWishlisted} variant="page" />
            )}
            <ShareButton name={product.name} />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 mt-5">
            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 rounded-xl p-3 text-xs font-bold">
              <TruckIcon className="w-5 h-5 shrink-0" />
              <span>ارسال سریع به سراسر کشور</span>
            </div>
            <div className="flex items-center gap-2.5 bg-blue-50 text-blue-700 rounded-xl p-3 text-xs font-bold">
              <ShieldIcon className="w-5 h-5 shrink-0" />
              <span>ضمانت اصالت کالا</span>
            </div>
            <div className="flex items-center gap-2.5 bg-amber-50 text-amber-700 rounded-xl p-3 text-xs font-bold">
              <CheckIcon className="w-5 h-5 shrink-0" />
              <span>پرداخت امن و مطمئن</span>
            </div>
            <div className="flex items-center gap-2.5 bg-purple-50 text-purple-700 rounded-xl p-3 text-xs font-bold">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              <span>۷ روز ضمانت بازگشت</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Specs */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <ProductTabs description={product.description} />
      </div>

      {/* Reviews section */}
      <div id="reviews" className="mt-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black text-slate-800">
              نظرات کاربران ({toFa(product.reviews.length)})
            </h2>

            {product.reviews.length > 0 && (
              <ReviewBreakdown reviews={product.reviews} avgRating={avgRating} />
            )}

            {product.reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-slate-500 text-sm">هنوز نظری ثبت نشده است.</div>
                <div className="text-slate-400 text-xs mt-1">اولین نفر باشید که نظر می‌دهید!</div>
              </div>
            ) : (
              <div className="space-y-3">
                {product.reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                          {r.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{r.user.name}</div>
                          <div className="text-xs text-slate-400">{formatDate(r.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex text-amber-400" dir="ltr">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <StarIcon
                            key={n}
                            className={`w-3.5 h-3.5 ${n <= r.rating ? "fill-current" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-slate-600 leading-7 mt-2">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review form sidebar */}
          <div>
            {session ? (
              purchased ? (
                <ReviewForm productId={product.id} />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-500 leading-7 sticky top-24">
                  <div className="text-3xl mb-3 text-center">📝</div>
                  <div className="text-center">
                    برای ثبت نظر، ابتدا باید این محصول را خریداری کرده باشید.
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-600 sticky top-24">
                <div className="text-center">
                  برای ثبت نظر
                  <Link
                    href={`/account/login?next=${encodeURIComponent(`/products/${slug}`)}`}
                    className="text-indigo-600 font-bold mx-1 hover:underline"
                  >
                    وارد حساب
                  </Link>
                  خود شوید.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-black text-slate-800 mb-4">محصولات مشابه</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedWithAvg.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile sticky add to cart */}
      {product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 lg:hidden z-40 safe-bottom">
          <div className="flex items-center gap-3 max-w-7xl mx-auto">
            <div className="shrink-0">
              <div className="text-lg font-black text-indigo-700">{toToman(price)}</div>
              {hasSale && (
                <div className="text-xs text-red-600 font-bold">
                  {toFa(Math.round(((product.price - price) / product.price) * 100))}٪ تخفیف
                </div>
              )}
            </div>
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      )}
    </div>
  );
}

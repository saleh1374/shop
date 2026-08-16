import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate } from "@/lib/format";
import { getSession } from "@/lib/auth";
import ProductGallery from "@/components/product-gallery";
import AddToCartButton from "@/components/add-to-cart-button";
import ReviewForm from "@/components/review-form";
import ProductCard from "@/components/product-card";
import WishlistButton from "@/components/wishlist-button";
import { StarIcon, TruckIcon, ShieldIcon, ChevronIcon, CheckIcon } from "@/components/icons";

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
    include: { images: { select: { url: true }, orderBy: { sortOrder: "asc" } } },
    take: 4,
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-3xl border border-slate-200 p-5 sm:p-8">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-900 mb-2">{product.name}</h1>

          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-sm text-indigo-600 hover:text-indigo-800 mb-3 w-fit"
            >
              {product.category.name}
            </Link>
          )}

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
              {avgRating > 0 ? toFa(avgRating.toFixed(1)) : "بدون امتیاز"} ({toFa(product.reviews.length)} نظر)
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-5">
            <div className="flex items-end gap-3 mb-2">
              <div className="text-3xl font-black text-indigo-700">{toToman(price)}</div>
              {hasSale && (
                <div className="text-base text-slate-400 line-through mb-1">{toToman(product.price)}</div>
              )}
              {hasSale && (
                <span className="mb-1.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                  {toFa(Math.round(((product.price - price) / product.price) * 100))}٪
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {product.stock > 0 ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckIcon className="w-4 h-4" /> موجود ({toFa(product.stock)} عدد)
                </span>
              ) : (
                <span className="text-red-600 font-bold">ناموجود</span>
              )}
            </div>
          </div>

          <AddToCartButton productId={product.id} stock={product.stock} />

          {session && (
            <div className="mt-3">
              <WishlistButton productId={product.id} isWishlisted={isWishlisted} variant="page" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-5 text-xs text-slate-600">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
              <TruckIcon className="w-5 h-5 text-indigo-600" />
              ارسال سریع به سراسر کشور
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
              <ShieldIcon className="w-5 h-5 text-indigo-600" />
              ضمانت اصالت کالا
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5 text-sm text-slate-700 leading-8 whitespace-pre-line">
            {product.description ?? "توضیحاتی برای این محصول ثبت نشده است."}
          </div>
        </div>
      </div>

      {/* نظرات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-slate-800">نظرات کاربران ({toFa(product.reviews.length)})</h2>
          {product.reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              هنوز نظری ثبت نشده است. اولین نفر باشید!
            </div>
          ) : (
            product.reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-800">{r.user.name}</div>
                  <div className="text-xs text-slate-400">{formatDate(r.createdAt)}</div>
                </div>
                <div className="flex text-amber-400 mb-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <StarIcon
                      key={n}
                      className={`w-4 h-4 ${n <= r.rating ? "fill-current" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-7">{r.comment}</p>
              </div>
            ))
          )}
        </div>

        <div>
          {session ? (
            purchased ? (
              <ReviewForm productId={product.id} />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-500 leading-7">
                برای ثبت نظر، ابتدا باید این محصول را خریداری کرده باشید.
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
              برای ثبت نظر
              <Link href={`/account/login?next=${encodeURIComponent(`/products/${slug}`)}`} className="text-indigo-600 font-bold mx-1">
                وارد حساب
              </Link>
              خود شوید.
            </div>
          )}
        </div>
      </div>

      {/* محصولات مشابه */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-black text-slate-800 mb-4">محصولات مشابه</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

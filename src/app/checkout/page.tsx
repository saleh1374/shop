import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { toFa, toToman } from "@/lib/format";
import CheckoutForm from "@/components/checkout-form";
import { CartIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { items, subtotal } = await getCart();
  const user = await getCurrentUser();

  if (items.length === 0) redirect("/cart");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-slate-800 mb-6">تسویه حساب</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CheckoutForm subtotal={subtotal} isLoggedIn={!!user} user={user} />
        </div>

        <aside className="hidden lg:block">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-24">
            <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
              <CartIcon className="w-5 h-5 text-indigo-600" /> اقلام سفارش
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => {
                const price = item.product.salePrice && item.product.salePrice > 0
                  ? item.product.salePrice
                  : item.product.price;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-slate-600 hover:text-indigo-600 line-clamp-1 font-bold"
                    >
                      {item.product.name}
                    </Link>
                    <span className="text-slate-400 text-xs shrink-0">
                      {toFa(item.quantity)} × {toToman(price)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

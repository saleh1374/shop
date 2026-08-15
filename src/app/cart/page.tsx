import Link from "next/link";
import { getCart } from "@/lib/cart";
import { toFa, toToman } from "@/lib/format";
import CartItems from "@/components/cart-items";
import { CartIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { items, subtotal, count } = await getCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-12">
          <span className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <CartIcon className="w-8 h-8" />
          </span>
          <h1 className="text-xl font-black text-slate-800 mb-2">سبد خرید شما خالی است</h1>
          <p className="text-sm text-slate-500 mb-6">
            از بین محصولات متنوع ما انتخاب کنید
          </p>
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white font-extrabold px-8 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-slate-800 mb-6">
        سبد خرید ({toFa(count)} کالا)
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CartItems items={items} />
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-black text-slate-800 mb-4">خلاصه سفارش</h2>
            <div className="flex items-center justify-between text-sm mb-2 text-slate-600">
              <span>جمع کالاها ({toFa(count)})</span>
              <span className="font-bold text-slate-800">{toToman(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2 text-slate-600">
              <span>هزینه ارسال</span>
              <span className="font-bold text-emerald-600">رایگان</span>
            </div>
            <div className="border-t border-dashed border-slate-200 my-4" />
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800">مبلغ قابل پرداخت</span>
              <span className="text-xl font-black text-indigo-700">{toToman(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="block mt-5 w-full h-12 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center hover:bg-indigo-700 active:scale-[0.99] transition"
            >
              ادامه فرآیند خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

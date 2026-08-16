import { getSettings, setting } from "@/lib/settings";
import Link from "next/link";

export default async function Footer() {
  const s = await getSettings();
  const storeName = setting(s, "store_name", "فروشگاه");
  const description = setting(s, "store_description");
  const phone = setting(s, "phone");
  const email = setting(s, "email");
  const address = setting(s, "address");
  const enamadCode = setting(s, "enamad_code");

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
              {storeName.charAt(0)}
            </span>
            <span className="font-extrabold text-white text-lg">{storeName}</span>
          </div>
          <p className="text-sm leading-6 text-slate-400">{description}</p>
        </div>

        <div>
          <h3 className="font-bold text-white mb-3">دسترسی سریع</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white transition">همه محصولات</Link></li>
            <li><Link href="/cart" className="hover:text-white transition">سبد خرید</Link></li>
            <li><Link href="/account/login" className="hover:text-white transition">حساب کاربری</Link></li>
            <li><Link href="/account/orders" className="hover:text-white transition">پیگیری سفارش</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white mb-3">اطلاعات تماس</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            {phone && <li dir="ltr" className="text-right">تلفن: {phone}</li>}
            {email && <li dir="ltr" className="text-right">ایمیل: {email}</li>}
            {address && <li>آدرس: {address}</li>}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white mb-3">قانونی</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white transition">درباره ما</Link></li>
            <li><Link href="/terms" className="hover:text-white transition">قوانین و مقررات</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">حریم خصوصی</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white mb-3">اعتماد شما</h3>
          {enamadCode ? (
            <div className="bg-white rounded-lg p-2 w-28 h-28 flex items-center justify-center text-xs text-slate-500">
              <a
                href={`https://enamad.ir/website/${encodeURIComponent(enamadCode)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 font-bold hover:underline"
              >
                نماد اعتماد الکترونیکی
              </a>
            </div>
          ) : (
            <div className="bg-slate-800 border border-dashed border-slate-600 rounded-lg p-4 text-xs text-slate-500 leading-5">
              جایگاه نماد اعتماد الکترونیکی (اینماد)
              <br />
              <span className="text-slate-400">پس از دریافت نماد، کد آن را در پنل مدیریت وارد کنید.</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          تمامی حقوق برای {storeName} محفوظ است. استفاده از مطالب فروشگاه فقط با ذکر منبع مجاز است.
        </div>
      </div>
    </footer>
  );
}

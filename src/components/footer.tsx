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
  const instagram = setting(s, "instagram");
  const telegram = setting(s, "telegram");
  const whatsapp = setting(s, "whatsapp");

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
              {storeName.charAt(0)}
            </span>
            <span className="font-extrabold text-white text-lg">{storeName}</span>
          </div>
          <p className="text-sm leading-6 text-slate-400">{description}</p>
          {(instagram || telegram || whatsapp) && (
            <div className="flex gap-2 mt-4">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition" aria-label="اینستاگرام">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {telegram && (
                <a href={telegram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center transition" aria-label="تلگرام">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
              )}
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-green-500 flex items-center justify-center transition" aria-label="واتساپ">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
            </div>
          )}
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

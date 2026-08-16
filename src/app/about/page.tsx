import Link from "next/link";
import { getSettings, setting } from "@/lib/settings";
import { ChevronIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = await getSettings();
  const storeName = setting(s, "store_name", "فروشگاه");
  const description = setting(s, "store_description");
  const phone = setting(s, "phone");
  const email = setting(s, "email");
  const address = setting(s, "address");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-indigo-600">خانه</Link>
        <ChevronIcon className="w-3 h-3 rotate-180" />
        <span className="text-slate-800 font-bold">درباره ما</span>
      </nav>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">درباره {storeName}</h1>

        <p className="text-slate-600 leading-8 text-lg">{description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-slate-50 rounded-2xl p-6">
            <h2 className="font-black text-slate-800 mb-3">چشم‌انداز ما</h2>
            <p className="text-slate-600 leading-8">
              ما با هدف ارائه بهترین خدمات و محصولات با کیفیت به مشتریان عزیز تأسیس شدیم.
              تیم ما همواره تلاش می‌کند تا تجربه خریدی لذت‌بخش و مطمئن برای شما فراهم کند.
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6">
            <h2 className="font-black text-slate-800 mb-3">ارزش‌های ما</h2>
            <ul className="text-slate-600 leading-8 space-y-2">
              <li>- کیفیت بالای محصولات</li>
              <li>- ارسال سریع و مطمئن</li>
              <li>- پشتیبانی صبورانه و حرفه‌ای</li>
              <li>- ضمانت اصالت کالا</li>
              <li>- قیمت مناسب و رقابتی</li>
            </ul>
          </div>
        </div>

        {(phone || email || address) && (
          <div className="bg-indigo-50 rounded-2xl p-6 mt-6">
            <h2 className="font-black text-slate-800 mb-3">تماس با ما</h2>
            <div className="text-slate-600 leading-8 space-y-1">
              {phone && <p>تلفن: {phone}</p>}
              {email && <p>ایمیل: {email}</p>}
              {address && <p>آدرس: {address}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

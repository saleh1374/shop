import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveSettings } from "@/app/admin/actions";
import { getActiveGateway, gatewayOptions, getPaymentSettings } from "@/lib/payment";
import { CreditCardIcon, ShieldIcon, InfoIcon, MailIcon } from "@/components/icons";
import TestEmailButton from "@/components/test-email-button";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const rows = await db.setting.findMany();
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;

  const gateway = getActiveGateway();
  const paymentSettings = await getPaymentSettings();

  const inputCls = "w-full h-11 rounded-xl border border-slate-200 px-3 text-sm";
  const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-5">تنظیمات فروشگاه</h1>

      <form action={saveSettings} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-4">اطلاعات فروشگاه</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>نام فروشگاه</label>
              <input name="store_name" defaultValue={s.store_name ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>تلفن</label>
              <input name="phone" defaultValue={s.phone ?? ""} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ایمیل</label>
              <input name="email" defaultValue={s.email ?? ""} className={inputCls} dir="ltr" />
            </div>
            <div>
              <label className={labelCls}>اینستاگرام</label>
              <input name="instagram" defaultValue={s.instagram ?? ""} className={inputCls} dir="ltr" />
            </div>
            <div>
              <label className={labelCls}>تلگرام</label>
              <input name="telegram" defaultValue={s.telegram ?? ""} className={inputCls} dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>آدرس</label>
              <input name="address" defaultValue={s.address ?? ""} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>توضیحات فروشگاه</label>
              <textarea
                name="store_description"
                rows={3}
                defaultValue={s.store_description ?? ""}
                className={`${inputCls} h-auto py-2.5 resize-none`}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-indigo-600" /> درگاه پرداخت
          </h2>
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
            <InfoIcon className="w-4 h-4" />
            درگاه فعلی: «{gateway.name}» — پرداخت به‌صورت آزمایشی انجام می‌شود.
          </p>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div>
              <label className={labelCls}>درگاه فعال</label>
              <select name="payment_gateway" defaultValue="simulation" className={inputCls} disabled>
                {gatewayOptions().map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>مرچنت‌کد زرین‌پال (برای اتصال بعدی)</label>
              <input
                name="zarinpal_merchant"
                defaultValue={s.zarinpal_merchant ?? ""}
                className={inputCls}
                dir="ltr"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                برای اتصال درگاه واقعی: مرچنت‌کد را وارد کنید و در فایل <code dir="ltr">src/lib/payment.ts</code> درگاه
                زرین‌پال را با همان اینترفیس اضافه کنید (قسمت Placeholder مشخص شده است).
              </p>
            </div>
            <div className="text-xs text-slate-400">
              وضعیت: <span className={paymentSettings.enabled ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                {paymentSettings.enabled ? "فعال" : "غیرفعال (آزمایشی)"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-indigo-600" /> نماد اعتماد الکترونیکی (اینماد)
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            بعد از دریافت نماد اینماد، کد HTML اعطا شده را در این قسمت قرار دهید تا در فوتر سایت نمایش داده شود.
          </p>
          <label className={labelCls}>کد اینماد</label>
          <textarea
            name="enamad_code"
            rows={5}
            defaultValue={s.enamad_code ?? ""}
            className={`${inputCls} h-auto py-2.5 resize-none font-mono text-xs`}
            dir="ltr"
            placeholder={`<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=...'>...</a>`}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2">
            <MailIcon className="w-5 h-5 text-indigo-600" /> تنظیمات ایمیل (SMTP)
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            برای ارسال ایمیل (بازیابی رمز، تأیید سفارش و...) سرور SMTP خود را تنظیم کنید.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>هاست SMTP</label>
              <input name="smtp_host" defaultValue={s.smtp_host ?? ""} className={inputCls} dir="ltr" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className={labelCls}>پورت</label>
              <input name="smtp_port" defaultValue={s.smtp_port ?? "465"} className={inputCls} dir="ltr" placeholder="465" />
            </div>
            <div>
              <label className={labelCls}>نام کاربری</label>
              <input name="smtp_user" defaultValue={s.smtp_user ?? ""} className={inputCls} dir="ltr" placeholder="you@gmail.com" />
            </div>
            <div>
              <label className={labelCls}>رمز عبور</label>
              <input name="smtp_pass" type="password" defaultValue={s.smtp_pass ?? ""} className={inputCls} dir="ltr" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>آدرس ایمیل فروشگاه</label>
              <input name="store_email" defaultValue={s.store_email ?? ""} className={inputCls} dir="ltr" placeholder="info@shop.ir" />
            </div>
            <div>
              <label className={labelCls}>آدرس سایت (برای نقشه سایت)</label>
              <input name="store_url" defaultValue={s.store_url ?? "http://localhost:3000"} className={inputCls} dir="ltr" placeholder="https://shop.ir" />
            </div>
          </div>
          <TestEmailButton />
        </div>

        <button
          type="submit"
          className="h-12 px-10 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
        >
          ذخیره تنظیمات
        </button>
      </form>
    </div>
  );
}

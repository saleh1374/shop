import Link from "next/link";
import { ChevronIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-indigo-600">خانه</Link>
        <ChevronIcon className="w-3 h-3 rotate-180" />
        <span className="text-slate-800 font-bold">قوانین و مقررات</span>
      </nav>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">قوانین و مقررات</h1>

        <div className="text-slate-600 leading-8 space-y-6">
          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۱. شرایط عمومی</h2>
            <p>
              استفاده از خدمات فروشگاه به معنای پذیرش تمامی قوانین و مقررات مندرج در این صفحه است.
              کاربران موظف هستند پیش از ثبت سفارش، قوانین را به دقت مطالعه کنند.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۲. شرایط خرید</h2>
            <p>
              کلیه قیمت‌ها به تومان بوده و شامل مالیات بر ارزش افزوده نمی‌باشد (مگر در موارد ذکر شده).
              فروشگاه حق تغییر قیمت‌ها را بدون اطلاع قبلی محفوظ می‌دارد.
              ثبت سفارش به معنای تأیید نهایی قیمت و مشخصات محصول توسط خریدار است.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۳. ارسال و تحویل</h2>
            <p>
              زمان ارسال محصولات بسته به نوع انتخاب مشتری متفاوت است.
              فروشگاه تلاش می‌کند سفارشات را در سریع‌ترین زمان ممکن ارسال کند.
              در صورت تأخیر غیرمنتظره، مشتری از طریق پیامک یا ایمیل مطلع خواهد شد.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۴. شرایط بازگشت کالا</h2>
            <p>
              در صورت وجود ایراد فیزیکی یا مغایرت با مشخصات درج شده، امکان بازگشت کالا تا ۷ روز پس از تحویل وجود دارد.
              کالا باید در بسته‌بندی اصلی و بدون استفاده باشد.
              هزینه بازگشت کالا در صورت ایراد فروشگاه بر عهده فروشگاه و در غیر این صورت بر عهده خریدار است.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۵. پرداخت</h2>
            <p>
              پرداخت آنلاین از طریق درگاه‌های معتبر بانکی انجام می‌شود.
              پرداخت در محل (نقدی) نیز برای ساکنین برخی شهرها امکان‌پذیر است.
              تمامی تراکنش‌های مالی از طریق سرورهای امن بانکی انجام می‌شود.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۶. حریم خصوصی</h2>
            <p>
              اطلاعات شخصی کاربران (نام، ایمیل، شماره تلفن و آدرس) صرفاً جهت انجام سفارش و ارسال کالا استفاده می‌شود.
              فروشگاه متعهد به حفاظت از اطلاعات شخصی کاربران بوده و آن‌ها را در اختیار اشخاص ثالث قرار نخواهد داد.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۷. پشتیبانی</h2>
            <p>
              تیم پشتیبانی ما در تمام ساعات کاری آماده پاسخگویی به سؤالات و مشکلات شماست.
              برای ارتباط با ما از طریق شماره تلفن یا ایمیل درج شده در سایت اقدام کنید.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

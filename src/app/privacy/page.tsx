import Link from "next/link";
import { ChevronIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-indigo-600">خانه</Link>
        <ChevronIcon className="w-3 h-3 rotate-180" />
        <span className="text-slate-800 font-bold">حریم خصوصی</span>
      </nav>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">سیاست حفظ حریم خصوصی</h1>

        <div className="text-slate-600 leading-8 space-y-6">
          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۱. جمع‌آوری اطلاعات</h2>
            <p>
              ما اطلاعات زیر را از کاربران جمع‌آوری می‌کنیم:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>نام و نام خانوادگی</li>
              <li>آدرس ایمیل</li>
              <li>شماره تلفن همراه</li>
              <li>آدرس پستی</li>
              <li>تاریخچه سفارشات</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۲. استفاده از اطلاعات</h2>
            <p>
              اطلاعات جمع‌آوری شده صرفاً برای اهداف زیر استفاده می‌شود:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>پردازش و ارسال سفارشات</li>
              <li>ارتباط با مشتری در خصوص وضعیت سفارش</li>
              <li>بهبود خدمات و تجربه کاربری</li>
              <li>ارسال اطلاعیه‌های مربوط به سفارش</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۳. حفاظت از اطلاعات</h2>
            <p>
              ما از تدابیر امنیتی مناسب برای حفاظت از اطلاعات شخصی کاربران استفاده می‌کنیم.
              اطلاعات حساس (مانند رمز عبور) به صورت رمزنگاری شده ذخیره می‌شوند.
              ارتباطات بین مرورگر کاربر و سرور ما از طریق پروتکل HTTPS رمزنگاری شده انجام می‌شود.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۴. اشتراک‌گذاری اطلاعات</h2>
            <p>
              ما اطلاعات شخصی کاربران را با اشخاص ثالث به اشتراک نمی‌گذاریم، مگر در موارد زیر:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>ارسال کالا (اطلاعات آدرس و شماره تلفن به شرکت پستی)</li>
              <li>پرداخت آنلاین (اطلاعات تراکنش به درگاه بانکی)</li>
              <li>در صورت الزام قانونی</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۵. کوکی‌ها</h2>
            <p>
              از کوکی‌ها برای بهباد تجربه کاربری استفاده می‌کنیم.
              کوکی‌های ضروری برای عملکرد سایت (سبد خرید، احراز هویت) همواره فعال هستند.
              کاربران می‌توانند تنظیمات مرورگر خود را برای غیرفعال کردن کوکی‌ها تغییر دهند،
              اما این امر ممکن است عملکرد برخی بخش‌های سایت را تحت تأثیر قرار دهد.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۶. حقوق کاربران</h2>
            <p>
              کاربران حق دارند:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>اطلاعات شخصی خود را مشاهده و ویرایش کنند</li>
              <li>حساب کاربری خود را حذف کنند</li>
              <li>از دریافت ایمیل‌های تبلیغاتی انصراف دهند</li>
              <li>درخواست حذف اطلاعات خود را ارسال کنند</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 mb-2">۷. تماس با ما</h2>
            <p>
              برای سؤالات مربوط به حریم خصوصی، از طریق ایمیل یا شماره تلفن درج شده در سایت با ما تماس بگیرید.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

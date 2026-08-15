# فروشگاه نمونه — سورسکد کامل

فروشگاه اینترنتی کامل با Next.js 16 (App Router, TypeScript, Tailwind CSS 4) و PostgreSQL + Prisma 7.
ویژگیها: فروشگاه + پنل ادمین کامل، گالری چند عکس محصول، حساب کاربری، امتیاز و نظر، کد تخفیف، جستجو/فیلتر/مرتبسازی، سبد خرید، ثبت سفارش، درگاه پرداخت آزمایشی (آمادهٔ اتصال زرینپال).

جزئیات کامل در [PRD.md](../PRD.md).

---

## راهاندازی (توسعه محلی)

پیشنیاز: Node.js 20+ و PostgreSQL (مثلاً نسخهٔ 17).

```bash
# ۱) نصب وابستگیها
npm install

# ۲) ساخت دیتابیس و کاربر (یک بار)
psql -U postgres -h localhost -c "CREATE DATABASE shop;"

# ۳) تنظیم متغیرهای محیطی (کپی از نمونه)
cp .env.example .env
#   DATABASE_URL را مطابق دیتابیس خود تنظیم کنید
#   AUTH_SECRET را به یک رشتهٔ تصادفی بلند تغییر دهید

# ۴) اعمال مایگریشن‌ها + داده‌های نمونه
npm run db:migrate
npm run db:seed

# ۵) اجرای توسعه
npm run dev
```

سایت روی `http://localhost:3000` بالا میآید.

### کاربران نمونه (پس از seed)
| نقش | ایمیل | رمز |
|---|---|---|
| مدیر | admin@shop.ir | admin123 |
| مشتری | ali@shop.ir | user123 |

کدهای تخفیف نمونه: `WELCOME10`، `FIXED200`، `SUMMER15`

---

## ساخت نسخهٔ تولید (هاست / سرور)

پروژه با `output: "standalone"` ساخته میشود؛ برای اجرا روی سرور:

```bash
# ۱) ساخت خروجی
npm run build

# ۲) اجرا با سرور standalone (توصیه‌شده)
node .next/standalone/server.js
# (قبل از آن در پوشهٔ standalone: کپی .env، پوشهٔ public، و .next/static)

# یا ساده‌تر:
npm run start
```

> نکته: در حالت standalone، فایلهای استاتیک را کپی کنید:
> `Copy-Item public -Destination .next/standalone/public -Recurse` و
> `Copy-Item .next/static -Destination .next/standalone/.next/static -Recurse`

---

## انتقال به هاست / سرور دیگر

دیتابیس کاملاً قابل انتقال است (بدون وابستگی به مسیر محلی):

1. **دیتابیس**: در مقصد، `DATABASE_URL` جدید را در `.env` تنظیم کنید و اجرا کنید:
   ```bash
   npm run db:deploy   # معادل prisma migrate deploy
   ```
   (برای کپی دادههای فعلی: backup/restore با `pg_dump` و `pg_restore`، یا به‌جای deploy از همان فایل dump استفاده کنید.)

2. **فایلهای آپلودی**: پوشهٔ `public/uploads/` را همراه پروژه منتقل کنید.

3. **سازگاری**: بدون تغییر کد، با هر میزبانی که Node.js 20+ و PostgreSQL دارد کار میکند.

---

## اتصال درگاه پرداخت واقعی (زرینپال و…)

درگاه فعلی `SimulationGateway` است (پرداخت آزمایشی). برای اتصال درگاه واقعی:

1. یک کلاس جدید از اینترفیس `PaymentGateway` در `src/lib/payment.ts` بسازید (مثل `ZarinpalGateway`).
2. در تابع `getActiveGateway()` منطق انتخاب بر اساس `setting("zarinpal_merchant")` را اضافه کنید.
3. مرچنتکد زرینپال را از پنل ادمین → «تنظیمات» وارد کنید (فیلد موجود است).

کد اینماد هم از پنل ادمین قابل ثبت است و در فوتر نمایش داده میشود.

---

## اسکریپت‌ها

| دستور | توضیح |
|---|---|
| `npm run dev` | سرور توسعه |
| `npm run build` | ساخت تولید (standalone) |
| `npm run start` | اجرای نسخهٔ ساخته‌شده |
| `npm run lint` | بررسی کد |
| `npm run db:migrate` | ساخت مایگریشن و اعمال |
| `npm run db:deploy` | اعمال مایگریشن‌ها روی مقصد (بدون ساخت جدید) |
| `npm run db:seed` | داده‌های نمونه |
| `npm run db:studio` | رابط بصری دیتابیس |

## تست خودکار (اختیاری)

```bash
npm install -D playwright && npx playwright install chromium
node e2e-test.mjs   # پس از اجرای `npm run start`
```

تست، فلوی کامل (لاگین → خرید → کد تخفیف → پرداخت → پنل ادمین) را در مرورگر واقعی بررسی میکند.

---

## ساختار مهم

```
src/
  app/            صفحات و اکشن‌های سرور (actions.ts + admin/actions.ts)
  components/     کامپوننت‌های UI (header, product-card, checkout-form, ...)
  lib/            auth (JWT)، db، payment (درگاه)، settings، cart، discount، format
  generated/      کلاینت تولیدشدهٔ Prisma
prisma/
  schema.prisma   مدل دیتابیس
  seed.ts         داده‌های نمونه
```
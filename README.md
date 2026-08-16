# فروشگاه اینترنتی

فروشگاه اینترنتی کامل با Next.js 16، React 19، Prisma 7، PostgreSQL و Tailwind CSS 4.

## امکانات

### کاربر
- ثبت‌نام و ورود (ایمیل + رمز عبور)
- ورود با گوگل (Google OAuth)
- بازیابی رمز عبور از طریق ایمیل
- پنل کاربری (پروفایل، سفارشات، آدرس‌ها، لیست علاقه‌مندی‌ها، نظرات)
- سبد خرید + تسویه حساب
- پیگیری سفارش
- دریافت نوتیفیکیشن (داخل سایت + ایمیل)

### ادمین
- داشبورد مدیریت
- مدیریت محصولات (CRUD، آپلود تصویر، حذف دسته‌جمعی)
- مدیریت دسته‌بندی‌ها
- مدیریت سفارشات (تغییر وضعیت، حذف دسته‌جمعی)
- مدیریت کاربران
- مدیریت نظرات
- مدیریت کدهای تخفیف
- گزارش‌گیری فروش
- تنظیمات فروشگاه (SMTP، درگاه پرداخت)

### امنیت
- هدرهای امنیتی (HSTS, CSP, X-Frame-Options, ...)
- Rate Limiting
- CSRF Protection
- JWT Session با jose
- رمزگذاری bcrypt
- فیلتر فایل آپلود

### سئو
- نقشه سایت (Sitemap) با ISR
- robots.txt
- JSON-LD (Schema.org)
- متادیتای OpenGraph
- صفحات استاتیک (درباره ما، شرایط، حریم خصوصی)

### عملکرد
- SSR + ISR
- Prisma Query Optimization
- Image Optimization (AVIF, WebP)
- Standalone Output (برای دیپلوی)
- Cache 60 ثانیه‌ای برای تنظیمات

## پیش‌نیازها

| نسخه | نرم‌افزار |
|------|----------|
| >= 18 | Node.js |
| >= 16 | PostgreSQL |
| >= 10 | npm |

## نصب و راه‌اندازی

### ۱. کلون کردن پروژه

```bash
git clone <آدرس-ریپازیتوری>
cd shop
```

### ۲. نصب وابستگی‌ها

```bash
npm install
```

### ۳. تنظیم متغیرهای محیطی

فایل `.env` رو بساز:

```bash
cp .env.example .env
```

و مقادیر زیر رو پر کن:

```env
# اتصال به دیتابیس
DATABASE_URL="postgresql://postgres@localhost:5432/shop"

# رمز امضای نشست (یه رشته تصادفی بلند)
AUTH_SECRET="یک-رشته-طولانی-و-تصادفی-اینجا"

# درگاه پرداخت زرین‌پال (اختیاری)
ZARINPAL_MERCHANT_ID=""

# تنظیمات SMTP برای ارسال ایمیل
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="you@gmail.com"
SMTP_PASS="app-password-gmail"

# آدرس سایت
STORE_URL="http://localhost:3000"

# ورود با گوگل (اختیاری)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### ۴. ساخت دیتابیس

```bash
# PostgreSQL رو استارت کن
# بعد دیتابیس رو بساز
createdb shop
# یا
psql -U postgres -c "CREATE DATABASE shop;"
```

### ۵. اجرای Migration

```bash
npx prisma db push --accept-data-loss
```

### ۶. Seed کردن دیتابیس (اختیاری - داده‌های نمونه)

```bash
npm run db:seed
```

### ۷. اجرای سرور توسعه

```bash
npm run dev
```

سایت در `http://localhost:3000` قابل دسترسیه.

## اطلاعات ورود (بعد از Seed)

| نقش | ایمیل | رمز عبور |
|-----|-------|----------|
| ادمین | admin@shop.ir | admin123 |
| کاربر | ali@shop.ir | user123 |

## دستورات مفید

```bash
# اجرای سرور توسعه
npm run dev

# بیلد پروداکشن
npm run build

# اجرای سرور پروداکشن
npm run start

# بررسی کدها (lint)
npm run lint

# مدیریت دیتابیس
npm run db:studio    # رابط گرافیکی دیتابیس
npm run db:seed      # داده‌های نمونه
npm run db:deploy    # اجرای migration در پروداکشن
```

## ساختار پروژه

```
shop/
├── prisma/
│   ├── schema.prisma          # مدل‌های دیتابیس
│   ├── seed.ts                # داده‌های نمونه
│   └── migrations/            # migrationها
├── src/
│   ├── app/
│   │   ├── page.tsx           # صفحه اصلی
│   │   ├── actions.ts         # Server Actions (احراز هویت، سبد خرید، سفارش)
│   │   ├── layout.tsx         # لایوت اصلی
│   │   ├── globals.css        # استایل‌های سراسری
│   │   ├── account/           # پنل کاربری
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── profile/
│   │   │   ├── orders/
│   │   │   ├── addresses/
│   │   │   ├── wishlist/
│   │   │   ├── reviews/
│   │   │   └── notifications/
│   │   ├── admin/             # پنل مدیریت
│   │   │   ├── page.tsx       # داشبورد
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   ├── users/
│   │   │   ├── discounts/
│   │   │   ├── reviews/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/google/   # OAuth گوگل
│   │   │   ├── admin/upload/  # آپلود فایل
│   │   │   └── product/view/  # شمارش بازدید
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── payment/
│   │   ├── products/
│   │   ├── about/
│   │   ├── terms/
│   │   └── privacy/
│   ├── components/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── product-card.tsx
│   │   ├── json-ld.tsx
│   │   └── view-tracker.tsx
│   ├── lib/
│   │   ├── auth.ts            # احراز هویت + JWT
│   │   ├── db.ts              # Prisma Client
│   │   ├── cart.ts            # مدیریت سبد خرید
│   │   ├── email.ts           # ارسال ایمیل (nodemailer)
│   │   ├── google-auth.ts     # Google OAuth
│   │   ├── notify.ts          # سیستم نوتیفیکیشن
│   │   ├── price.ts           # محاسبه قیمت
│   │   └── settings.ts        # تنظیمات فروشگاه
│   ├── generated/prisma/      # Prisma Client (خودکار)
│   └── proxy.ts               # Middleware احراز هویت
├── public/
│   └── uploads/               # فایل‌های آپلود شده
├── .env                       # متغیرهای محیطی
├── .env.example               # نمونه متغیرها
├── next.config.ts             # تنظیمات Next.js
├── tsconfig.json              # تنظیمات TypeScript
└── package.json
```

## تنظیم Google OAuth

### ساخت اپلیکیشن در Google Cloud

1. برو به [Google Cloud Console](https://console.cloud.google.com)
2. پروژه بساز یا انتخاب کن
3. از منوی سمت چپ: **APIs & Services → OAuth consent screen**
4. نوع: **External**، ایمیل ساپورت: ایمیل خودت
5. **Scopes** اضافه کن: `openid`, `email`, `profile`
6. **Test Users** اضافه کن: ایمیل‌هایی که میخوان تست کنن
7. از منوی سمت چپ: **APIs & Services → Credentials**
8. **+ Create Credentials → OAuth client ID**
9. نوع: **Web application**
10. فیلدها رو پر کن:

| فیلد | مقدار |
|------|-------|
| Name | نام اپلیکیشن |
| Authorized JavaScript origins | `http://localhost:3000` |
| Authorized redirect URIs | `http://localhost:3000/api/auth/google/callback` |

11. **Create** بزن
12. **Client ID** و **Client Secret** رو کپی کن و در `.env` قرار بده

### در سرور واقعی

فقط این دو فیلد رو به آدرس دامنه تغییر بده:

| فیلد | مقدار |
|------|-------|
| Authorized JavaScript origins | `https://yourdomain.com` |
| Authorized redirect URIs | `https://yourdomain.com/api/auth/google/callback` |

## تنظیم SMTP (ارسال ایمیل)

### Gmail

1. به حساب گوگل خودت برو
2. **Manage your Google Account → Security → 2-Step Verification** رو فعال کن
3. بعد از فعال‌سازی: **Manage your Google Account → Security → App passwords**
4. یه App Password بساز
5. رمز رو در `.env` قرار بده:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="you@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"
```

### تست ارسال ایمیل

به آدرس زیر برو: `/admin/settings`
دکمه **تست ایمیل** رو بزن تا مطمئن بشی SMTP کار میکنه.

## دیپلوی روی سرور

### ۱. نصب پیش‌نیازها روی سرور

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql nginx certbot python3-certbot-nginx

# Node.js (آخرین نسخه)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### ۲. آپلود پروژه

```bash
# کلون کنید
cd /var/www
git clone <آدرس-ریپازیتوری> shop
cd shop

# نصب وابستگی‌ها
npm install

# تنظیم .env
cp .env.example .env
nano .env
# مقادیر رو پر کن (DATABASE_URL, AUTH_SECRET, STORE_URL, SMTP)
```

### ۳. دیتابیس

```bash
# PostgreSQL رو تنظیم کنید
sudo -u postgres psql
CREATE USER shopuser WITH PASSWORD 'yourpassword';
CREATE DATABASE shop OWNER shopuser;
\q

# .env رو آپدیت کنید
# DATABASE_URL="postgresql://shopuser:yourpassword@localhost:5432/shop"

# Migration اجرا کنید
npx prisma db push --accept-data-loss

# Seed (اختیاری)
npm run db:seed
```

### ۴. بیلد

```bash
npm run build
```

### ۵. سرویس Systemd

فایل `/etc/systemd/system/shop.service` بسازید:

```ini
[Unit]
Description=Shop Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/shop
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

فعال‌سازی:

```bash
sudo systemctl daemon-reload
sudo systemctl enable shop
sudo systemctl start shop
```

### ۶. Nginx Reverse Proxy

فایل `/etc/nginx/sites-available/shop` بسازید:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # برای SSL (بعد از certbot)
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    location /uploads {
        alias /var/www/shop/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

فعال‌سازی:

```bash
sudo ln -s /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### ۷. SSL با Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com
```

### ۸. آپلود تصاویر

پوشه `public/uploads` باید قابل نوشتن باشه:

```bash
sudo chown -R www-data:www-data /var/www/shop/public/uploads
sudo chmod -R 755 /var/www/shop/public/uploads
```

## به‌روزرسانی

```bash
cd /var/www/shop

# آخرین تغییرات رو بگیرید
git pull

# نصب وابستگی‌های جدید
npm install

# بیلد
npm run build

# ری‌استارت سرویس
sudo systemctl restart shop
```

## عیب‌یابی

### سرور استارت نمیشه

```bash
# لاگ سرویس رو چک کنید
sudo journalctl -u shop -f

# یا
sudo systemctl status shop
```

### خطای دیتابیس

```bash
# PostgreSQL رو چک کنید
sudo systemctl status postgresql

# اتصال رو تست کنید
psql -U shopuser -d shop -h localhost
```

### خطای ایمیل

```bash
# SMTP رو تست کنید
# از صفحه /admin/settings استفاده کنید
# یا لاگ سرور رو چک کنید
sudo journalctl -u shop | grep -i mail
```

### خطای Google OAuth

1. مطمئن شوید `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` درست هستن
2. مطمئن شوید **Redirect URI** دقیقاً با آدرس سایت شما مطابقت داره
3. مطمئن شوید کاربر در لیست **Test Users** اضافه شده (اگه اپ Publish نشده)

## پشتیبان‌گیری

### دیتابیس

```bash
# پشتیبان‌گیری
pg_dump -U shopuser -d shop > backup_$(date +%Y%m%d).sql

# بازیابی
psql -U shopuser -d shop < backup_20260816.sql
```

### فایل‌های آپلود شده

```bash
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/shop/public/uploads
```

## لایسنس

MIT License

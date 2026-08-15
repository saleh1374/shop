import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { toSlug } from "../src/lib/format";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const PALETTE = [
  ["#4f46e5", "#818cf8"],
  ["#0d9488", "#5eead4"],
  ["#dc2626", "#fca5a5"],
  ["#ea580c", "#fdba74"],
  ["#7c3aed", "#c4b5fd"],
  ["#059669", "#6ee7b7"],
  ["#d97706", "#fcd34d"],
  ["#2563eb", "#93c5fd"],
  ["#db2777", "#f9a8d4"],
  ["#0891b2", "#67e8f9"],
];

function svgImage(name: string, i: number) {
  const [c1, c2] = PALETTE[i % PALETTE.length];
  const label = name.replace(/[^آ-یa-z0-9]/g, " ").trim().slice(0, 20);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="400" cy="330" r="150" fill="rgba(255,255,255,0.15)"/>
  <text x="400" y="360" font-family="Segoe UI, Tahoma, sans-serif" font-size="42" fill="#fff" text-anchor="middle" font-weight="bold">${label}</text>
  <text x="400" y="430" font-family="Segoe UI, Tahoma, sans-serif" font-size="22" fill="rgba(255,255,255,0.85)" text-anchor="middle">تصویر نمونه محصول</text>
</svg>`;
}

const CATEGORIES = [
  { name: "موبایل و تبلت" },
  { name: "لپ‌تاپ و کامپیوتر" },
  { name: "صوتی و تصویری" },
  { name: "لوازم خانگی" },
  { name: "پوشاک" },
  { name: "کالای دیجیتال" },
];

const SUB_CATEGORIES: Record<string, string[]> = {
  "موبایل و تبلت": ["گوشی موبایل", "تبلت", "لوازم جانبی موبایل"],
  "لپ‌تاپ و کامپیوتر": ["لپ‌تاپ", "میزکار", "قطعات"],
  "صوتی و تصویری": ["هدفون و هندزفری", "اسپیکر", "تلویزیون"],
  "لوازم خانگی": ["آشپزخانه", "شوینده", "حرارتی و برقی"],
  "پوشاک": ["مردانه", "زنانه", "کودک"],
  "کالای دیجیتال": ["ساعت هوشمند", "دوربین", "گجت‌ها"],
};

const PRODUCTS: { name: string; cat: string; price: number; sale?: number; stock: number; desc: string; featured?: boolean }[] = [
  { name: "گوشی موبایل سامسونگ گلکسی A55", cat: "گوشی موبایل", price: 21_500_000, sale: 19_800_000, stock: 25, featured: true, desc: "گوشی هوشمند با نمایشگر سوپر امولد، دوربین ۵۰ مگاپیکسلی و باتری ۵۰۰۰ میلی‌آمپری. گارانتی ۱۸ ماهه شرکتی." },
  { name: "گوشی موبایل شیائومی ردمی نوت 13", cat: "گوشی موبایل", price: 12_900_000, stock: 40, desc: "گوشی اقتصادی با نمایشگر امولد ۱۲۰ هرتز، پردازنده اسنپ‌دراگون و شارژ سریع ۶۷ وات." },
  { name: "گوشی موبایل اپل آیفون 15", cat: "گوشی موبایل", price: 78_000_000, sale: 74_500_000, stock: 8, featured: true, desc: "آیفون ۱۵ با تراشه A16 Bionic، دوربین دوگانه ۴۸ مگاپیکسلی و داینامیک آیلند. گارانتی ۱۲ ماهه." },
  { name: "تبلت سامسونگ گلکسی Tab S9", cat: "تبلت", price: 32_500_000, stock: 12, desc: "تبلت حرفه‌ای با نمایشگر ۱۱ اینچی AMOLED و قلم S Pen. مناسب کار و سرگرمی." },
  { name: "لپ‌تاپ ایسوس Zenbook 14", cat: "لپ‌تاپ", price: 58_000_000, sale: 52_000_000, stock: 6, featured: true, desc: "لپ‌تاپ باریک و سبک با پردازنده Core Ultra 7، ۱۶ گیگابایت رم و ۱ ترابایت SSD." },
  { name: "لپ‌تاپ ایسر Aspire 5", cat: "لپ‌تاپ", price: 26_500_000, stock: 15, desc: "لپ‌تاپ اقتصادی با پردازنده Core i5 نسل ۱۳، ۸ گیگابایت رم و ۵۱۲ گیگابایت SSD." },
  { name: "مونیتور ال‌جی 27 اینچ 4K", cat: "میزکار", price: 18_900_000, stock: 10, desc: "مانیتور ۲۷ اینچی 4K با پنل IPS و رفرش‌ریت ۶۰ هرتز. مناسب طراحی و کار اداری." },
  { name: "هدفون بی‌سیم سونی WH-1000XM5", cat: "هدفون و هندزفری", price: 19_800_000, sale: 17_200_000, stock: 20, featured: true, desc: "هدفون حذف نویز فعال با بهترین کیفیت صدا، ۳۰ ساعت پخش مداوم و شارژ سریع." },
  { name: "هدفون بی‌سیم اپل ایرپادز پرو 2", cat: "هدفون و هندزفری", price: 14_300_000, stock: 30, desc: "ایرپادز پرو ۲ با حذف نویز فعال، صدای فضایی و کیس شارژ MagSafe." },
  { name: "هندزفری شیائومی ردمی بادز 5", cat: "هدفون و هندزفری", price: 1_890_000, stock: 60, desc: "هندزفری بی‌سیم اقتصادی با بلوتوث 5.3، میکروفون و باتری ۳۰ ساعته." },
  { name: "اسپیکر بلوتوثی جی‌بی‌ال Charge 5", cat: "اسپیکر", price: 9_500_000, sale: 8_200_000, stock: 18, desc: "اسپیکر مقاوم در برابر آب با صدای قدرتمند و ۲۰ ساعت پخش موسیقی." },
  { name: "تلویزیون سامسونگ 55 اینچ 4K", cat: "تلویزیون", price: 28_900_000, stock: 9, desc: "تلویزیون کریستال ۴K با سیستم عامل تایزن، هوش مصنوعی و کیفیت تصویر فوق‌العاده." },
  { name: "ماشین لباسشویی ال‌جی 9 کیلو", cat: "شوینده", price: 24_500_000, stock: 7, desc: "لباسشویی ۹ کیلویی با موتور اینورتر مستقیم، بخارشوی و ۱۴ برنامه شستشو." },
  { name: "یخچال ساید بای ساید سامسونگ", cat: "آشپزخانه", price: 87_000_000, sale: 79_500_000, stock: 3, featured: true, desc: "یخچال ساید ۲۶ فوت با تکنولوژی خنک‌کنندگی دوگانه و آب‌سردکن و یخ‌ساز." },
  { name: "مایکروویو پاناسونیک ۳۰ لیتری", cat: "آشپزخانه", price: 8_900_000, stock: 14, desc: "مایکروویو ۳۰ لیتری با گریل، سنسور پخت و ۶ سطح قدرت." },
  { name: "پیراهن مردانه آستین بلند", cat: "مردانه", price: 780_000, sale: 620_000, stock: 50, desc: "پیراهن مردانه با پارچه نخ پنبه، یقه کلاسیک و دوخت تمیز. سایزهای M تا XXL." },
  { name: "مانتو زنانه پاییزه", cat: "زنانه", price: 1_450_000, stock: 35, desc: "مانتو زنانه با پارچه کریستال، فاقد آستر و مناسب فصل پاییز. رنگ‌بندی متنوع." },
  { name: "کفش اسپرت مردانه", cat: "مردانه", price: 2_300_000, sale: 1_950_000, stock: 28, featured: true, desc: "کفش اسپرت با زیره نرم و تنفس‌پذیر، مناسب پیاده‌روی و روزمره." },
  { name: "ساعت هوشمند اپل واچ سری 9", cat: "ساعت هوشمند", price: 24_900_000, sale: 22_800_000, stock: 11, featured: true, desc: "اپل واچ سری ۹ با نمایشگر همیشه روشن، سنسور ضربان قلب و GPS. بند سیلیکونی." },
  { name: "ساعت هوشمند امیزفیت GTS 4", cat: "ساعت هوشمند", price: 5_400_000, stock: 22, desc: "ساعت هوشمند با نمایشگر AMOLED، ۱۵۰ حالت ورزشی و ۱۴ روز باتری." },
  { name: "دوربین عکاسی کانن EOS R50", cat: "دوربین", price: 42_000_000, stock: 5, desc: "دوربین بدون آینه با سنسور ۲۴ مگاپیکسلی، فیلم‌برداری 4K و صفحه نمایش چرخان." },
  { name: "پاوربانک شیائومی 20000mAh", cat: "گجت‌ها", price: 1_650_000, sale: 1_390_000, stock: 45, desc: "پاوربانک ۲۰۰۰۰ میلی‌آمپری با شارژ سریع 22.5 وات و دو خروجی." },
  { name: "کیبورد مکانیکال ردراگون", cat: "قطعات", price: 2_850_000, stock: 17, desc: "کیبورد مکانیکال با سوئیچ قرمز، نورپردازی RGB و بدنه آلومینیومی." },
  { name: "ماوس گیمینگ لاجیتک G502", cat: "قطعات", price: 3_200_000, stock: 19, desc: "ماوس گیمینگ با سنسور ۲۵۶۰۰ DPI، ۱۱ دکمه برنامه‌پذیر و نور RGB." },
];

async function main() {
  console.log("حذف داده‌های قبلی...");
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.review.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.discountCode.deleteMany();
  await db.setting.deleteMany();
  await db.user.deleteMany();

  console.log("ساخت دسته‌بندی‌ها...");
  for (const c of CATEGORIES) {
    const parent = await db.category.create({ data: { name: c.name, slug: toSlug(c.name) } });
    for (const sub of SUB_CATEGORIES[c.name] ?? []) {
      await db.category.create({ data: { name: sub, slug: toSlug(`${c.name}-${sub}`), parentId: parent.id } });
    }
  }

  const cats = await db.category.findMany();
  const catByName = (n: string) => cats.find((c) => c.name === n)!;

  console.log("ساخت محصولات و عکس‌ها...");
  const uploadDir = join(process.cwd(), "public", "uploads", "products");
  mkdirSync(uploadDir, { recursive: true });

  let i = 0;
  for (const p of PRODUCTS) {
    const slug = toSlug(p.name);
    const images = [];
    for (let k = 0; k < 3; k++) {
      const file = `${slug}-${k}.svg`;
      writeFileSync(join(uploadDir, file), svgImage(p.name, i + k));
      images.push({ url: `/uploads/products/${file}`, sortOrder: k });
    }
    await db.product.create({
      data: {
        name: p.name,
        slug,
        price: p.price,
        salePrice: p.sale ?? null,
        stock: p.stock,
        featured: p.featured ?? false,
        description: p.desc,
        categoryId: catByName(p.cat).id,
        images: { create: images },
      },
    });
    i++;
  }

  console.log("ساخت نظرات نمونه...");
  const admin = await db.user.create({
    data: {
      name: "مدیر فروشگاه",
      email: "admin@shop.ir",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });
  const user = await db.user.create({
    data: {
      name: "علی رضایی",
      email: "ali@shop.ir",
      phone: "09121234567",
      password: await bcrypt.hash("user123", 10),
    },
  });
  const sampleProducts = await db.product.findMany({ take: 5 });
  for (const [idx, product] of sampleProducts.entries()) {
    await db.review.create({
      data: {
        rating: 4 + (idx % 2),
        comment: "کیفیت عالی داشت، ارسال هم سریع بود. خرید از این فروشگاه رو پیشنهاد می‌کنم.",
        status: "APPROVED",
        userId: user.id,
        productId: product.id,
      },
    });
    await db.review.create({
      data: {
        rating: 5,
        comment: "دقیقاً مطابق توضیحات بود. ممنون از تیم فروشگاه.",
        status: "APPROVED",
        userId: admin.id,
        productId: product.id,
      },
    });
  }

  console.log("ساخت کدهای تخفیف...");
  await db.discountCode.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: 10, maxAmount: 500_000, minAmount: 500_000, expiresAt: new Date(Date.now() + 30 * 86400_000) },
      { code: "FIXED200", type: "FIXED", value: 200_000, minAmount: 1_000_000 },
      { code: "SUMMER15", type: "PERCENT", value: 15, maxAmount: 800_000, usageLimit: 100 },
    ],
  });

  console.log("ساخت تنظیمات فروشگاه...");
  await db.setting.createMany({
    data: [
      { key: "store_name", value: "فروشگاه نمونه" },
      { key: "store_description", value: "فروشگاه اینترنتی با بهترین قیمت‌ها و ارسال سریع به سراسر کشور" },
      { key: "phone", value: "۰۲۱-۹۱۰۰۰۰۰۰" },
      { key: "email", value: "info@shop.ir" },
      { key: "address", value: "تهران، خیابان ولیعصر، مرکز خرید نمونه" },
      { key: "instagram", value: "" },
      { key: "telegram", value: "" },
      { key: "enamad_code", value: "" },
      { key: "zarinpal_merchant", value: "" },
    ],
  });

  console.log("✓ دیتای نمونه با موفقیت ساخته شد");
  console.log("  ادمین: admin@shop.ir / admin123");
  console.log("  کاربر: ali@shop.ir / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSettings, setting } from "@/lib/settings";
import { toFa, toToman } from "@/lib/format";
import ProductCard from "@/components/product-card";
import { TruckIcon, ShieldIcon, PhoneIcon, CreditCardIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const storeName = setting(settings, "store_name", "فروشگاه");

  const [featured, latest, categories] = await Promise.all([
    db.product.findMany({
      where: { active: true, featured: true },
      include: { images: { select: { url: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.product.findMany({
      where: { active: true },
      include: { images: { select: { url: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.category.findMany({
      where: { parentId: null },
      include: { products: { select: { id: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const perks = [
    { icon: TruckIcon, title: "ارسال سریع", desc: "به سراسر کشور" },
    { icon: ShieldIcon, title: "ضمانت اصالت", desc: "کالای اورجینال" },
    { icon: CreditCardIcon, title: "پرداخت امن", desc: "درگاه معتبر" },
    { icon: PhoneIcon, title: "پشتیبانی ۲۴/۷", desc: "هر زمان که بخواهید" },
  ];

  return (
    <div>
      {/* بنر اصلی */}
      <section className="bg-gradient-to-l from-indigo-600 via-indigo-500 to-violet-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            به {storeName} خوش آمدید
          </h1>
          <p className="text-indigo-100 max-w-xl mx-auto mb-6">
            {setting(settings, "store_description")}
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-indigo-700 font-extrabold px-8 py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg"
          >
            مشاهده محصولات
          </Link>
        </div>
      </section>

      {/* مزایا */}
      <section className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-slate-100">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3 p-4">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5" />
              </span>
              <div>
                <div className="font-bold text-sm text-slate-800">{p.title}</div>
                <div className="text-xs text-slate-500">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* دسته‌بندی‌ها */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-black text-slate-800 mb-4">دسته‌بندی محصولات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-400 hover:shadow-md transition group"
            >
              <div className="font-bold text-sm text-slate-700 group-hover:text-indigo-700 transition">
                {c.name}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {toFa(c.products.length)} محصول
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* محصولات ویژه */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-800">محصولات ویژه</h2>
            <Link href="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
              مشاهده همه ←
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* جدیدترین محصولات */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-800">جدیدترین محصولات</h2>
          <Link href="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
            مشاهده همه ←
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* بنر پایین */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="relative rounded-3xl overflow-hidden">
          <Image
            src="/uploads/banner.svg"
            alt="خرید مطمئن"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 to-slate-900/40" />
          <div className="relative p-10 text-white max-w-lg">
            <h2 className="text-2xl font-black mb-2">خرید آسان و مطمئن</h2>
            <p className="text-slate-200 text-sm leading-7">
              با ثبت سفارش و پرداخت آنلاین، سفارش خود را در سریع‌ترین زمان دریافت کنید.
              پشتیبانی ما در تمام مراحل کنار شماست.
            </p>
            <Link
              href="/products"
              className="inline-block mt-5 bg-white text-slate-900 font-extrabold px-6 py-2.5 rounded-xl hover:bg-slate-100 transition text-sm"
            >
              همین حالا خرید کنید
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

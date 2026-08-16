import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 p-10">
        <div className="text-6xl font-black text-indigo-600 mb-3">۴۰۴</div>
        <h1 className="text-xl font-black text-slate-800 mb-2">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
        <p className="text-sm text-slate-500 leading-7 mb-6">
          آدرس اشتباه است یا صفحه حذف شده. از صفحه اصلی فروشگاه ادامه دهید.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
        >
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}
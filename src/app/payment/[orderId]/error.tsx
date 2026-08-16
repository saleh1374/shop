"use client";

export default function PaymentError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 p-10">
        <div className="text-6xl font-black text-red-500 mb-3">!</div>
        <h1 className="text-xl font-black text-slate-800 mb-2">خطا در پرداخت</h1>
        <p className="text-sm text-slate-500 leading-7 mb-6">
          مشکلی در فرآیند پرداخت پیش آمده.
        </p>
        <button
          onClick={reset}
          className="inline-block px-8 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}

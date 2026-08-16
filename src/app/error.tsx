"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 p-10">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-black text-slate-800 mb-2">مشکلی پیش آمد</h1>
        <p className="text-sm text-slate-500 leading-7 mb-6">
          خطایی در نمایش این صفحه رخ داد. لطفاً دوباره تلاش کنید.
          {error.digest && (
            <span className="block mt-2 text-xs text-slate-400" dir="ltr">کد خطا: {error.digest}</span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
          >
            تلاش مجدد
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-indigo-400 transition"
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
}
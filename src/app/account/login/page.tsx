"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { loginUser } from "@/app/actions";

export default function LoginPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        <h1 className="text-2xl font-black text-slate-800 text-center mb-1">ورود به حساب</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          خوش آمدید! لطفاً وارد شوید
        </p>

        <form
          action={(formData) => {
            startTransition(async () => {
              const res = await loginUser(formData);
              if (res?.error) setError(res.error);
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">ایمیل</label>
            <input
              name="email"
              type="email"
              required
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">رمز عبور</label>
            <input
              name="password"
              type="password"
              required
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-11 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {pending ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-5">
          <Link
            href="/account/reset-password"
            className="text-indigo-600 font-bold hover:text-indigo-800 block mb-2"
          >
            رمز عبور را فراموش کرده‌اید؟
          </Link>
          حساب ندارید؟{" "}
          <Link
            href="/account/register"
            className="text-indigo-600 font-bold hover:text-indigo-800"
          >
            ثبت‌نام کنید
          </Link>
        </div>
      </div>
    </div>
  );
}

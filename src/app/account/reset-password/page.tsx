"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordRequest, resetPasswordConfirm } from "@/app/actions";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res: Record<string, unknown> = await resetPasswordRequest(email);
    setPending(false);
    if (res.error) {
      setError(String(res.error));
    } else {
      setSuccess(String(res.message ?? "کد بازیابی به ایمیل شما ارسال شد."));
      if (res.token) setToken(String(res.token));
      setStep("confirm");
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("رمز جدید حداقل ۶ حرف باشد");
    if (password !== confirm) return setError("تکرار رمز مطابقت ندارد");
    setPending(true);
    const res: Record<string, unknown> = await resetPasswordConfirm(token, password);
    setPending(false);
    if (res.error) setError(String(res.error));
    else setSuccess("رمز عبور با موفقیت تغییر کرد. در حال انتقال...");
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h1 className="text-2xl font-black text-slate-900 text-center mb-6">بازیابی رمز عبور</h1>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-bold mb-4">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-bold mb-4">
              {error}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <p className="text-sm text-slate-600 leading-7">
                ایمیل خود را وارد کنید. یک کد بازیابی برای شما ارسال خواهد شد.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ایمیل</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm"
                  placeholder="example@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full h-12 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {pending ? "در حال ارسال..." : "ارسال کد بازیابی"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4">
              <p className="text-sm text-slate-600 leading-7">
                رمز عبور جدید خود را وارد کنید.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">کد بازیابی</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">رمز جدید</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">تکرار رمز جدید</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full h-12 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {pending ? "در حال تغییر..." : "تغییر رمز عبور"}
              </button>
            </form>
          )}

          <div className="text-center mt-6 text-sm">
            <Link href="/account/login" className="text-indigo-600 font-bold hover:underline">
              بازگشت به صفحه ورود
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

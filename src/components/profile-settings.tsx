"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, changePassword } from "@/app/actions";
import { SettingsIcon, KeyIcon, CheckIcon } from "@/components/icons";

const inputCls =
  "w-full h-11 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:border-indigo-400 focus:outline-none";

export default function ProfileSettings({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pwdPending, startPwd] = useTransition();
  const [error, setError] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [ok, setOk] = useState("");
  const [pwdOk, setPwdOk] = useState("");

  function submitProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    startTransition(async () => {
      const res = await updateProfile(new FormData(e.currentTarget));
      if (res?.error) setError(res.error);
      else {
        setOk("اطلاعات با موفقیت ذخیره شد");
        router.refresh();
      }
    });
  }

  function submitPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPwdError("");
    setPwdOk("");
    startPwd(async () => {
      const res = await changePassword(new FormData(form));
      if (res?.error) setPwdError(res.error);
      else {
        setPwdOk("رمز عبور با موفقیت تغییر کرد");
        form.reset();
      }
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
        <SettingsIcon className="w-7 h-7 text-indigo-600" /> تنظیمات پروفایل
      </h1>

      <form onSubmit={submitProfile} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-black text-slate-800">اطلاعات شخصی</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">نام و نام خانوادگی *</label>
            <input name="name" defaultValue={name} required minLength={2} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">ایمیل *</label>
            <input name="email" defaultValue={email} type="email" required className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">شماره موبایل *</label>
            <input
              name="phone"
              defaultValue={phone ?? ""}
              required
              pattern="09[0-9]{9}"
              className={inputCls}
              placeholder="09121234567"
              dir="ltr"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
        {ok && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600 font-bold">
            <CheckIcon className="w-4 h-4" /> {ok}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 px-6 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>

      <form onSubmit={submitPassword} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-black text-slate-800 flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-indigo-600" /> تغییر رمز عبور
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">رمز فعلی *</label>
            <input name="current" type="password" required className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">رمز جدید *</label>
            <input name="next" type="password" required minLength={6} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">تکرار رمز جدید *</label>
            <input name="confirm" type="password" required minLength={6} className={inputCls} dir="ltr" />
          </div>
        </div>

        {pwdError && <p className="text-sm text-red-600 font-bold">{pwdError}</p>}
        {pwdOk && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600 font-bold">
            <CheckIcon className="w-4 h-4" /> {pwdOk}
          </p>
        )}

        <button
          type="submit"
          disabled={pwdPending}
          className="h-11 px-6 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition disabled:opacity-60"
        >
          {pwdPending ? "در حال تغییر..." : "تغییر رمز عبور"}
        </button>
      </form>
    </div>
  );
}
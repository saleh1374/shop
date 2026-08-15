"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDiscount } from "@/app/admin/actions";
import { EditIcon } from "@/components/icons";

type Discount = {
  id: string;
  code: string;
  type: string;
  value: number;
  maxAmount: number | null;
  minAmount: number | null;
  usageLimit: number | null;
  expiresAt: Date | null;
  active: boolean;
};

export default function DiscountForm({
  discount,
  compact = false,
}: {
  discount?: Discount;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveDiscount({
        id: discount?.id,
        code: String(form.get("code") ?? ""),
        type: String(form.get("type") ?? "PERCENT") as "PERCENT" | "FIXED",
        value: Number(form.get("value") ?? 0),
        maxAmount: String(form.get("maxAmount") ?? ""),
        minAmount: String(form.get("minAmount") ?? ""),
        usageLimit: String(form.get("usageLimit") ?? ""),
        expiresAt: String(form.get("expiresAt") ?? ""),
        active: form.get("active") !== "off",
      });
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (compact) {
    if (!open) {
      return (
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
          title="ویرایش"
        >
          <EditIcon className="w-4 h-4" />
        </button>
      );
    }
    return (
      <form onSubmit={submit} className="flex gap-1.5 items-center flex-wrap">
        <input name="code" defaultValue={discount?.code} required className="h-9 w-28 rounded-lg border border-slate-200 px-2 text-sm" dir="ltr" placeholder="CODE" />
        <input name="value" type="number" defaultValue={discount?.value} required className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-sm" placeholder="مقدار" />
        <select name="type" defaultValue={discount?.type} className="h-9 rounded-lg border border-slate-200 px-1 text-xs">
          <option value="PERCENT">٪</option>
          <option value="FIXED">تومان</option>
        </select>
        <button className="h-9 px-3 rounded-lg bg-indigo-600 text-white text-xs font-bold">ثبت</button>
        <button type="button" onClick={() => setOpen(false)} className="h-9 px-2 text-slate-400 text-xs">انصراف</button>
        {error && <span className="text-xs text-red-600 w-full">{error}</span>}
      </form>
    );
  }

  const inputCls = "w-full h-11 rounded-xl border border-slate-200 px-3 text-sm";
  const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>کد *</label>
          <input name="code" required className={inputCls} placeholder="WELCOME10" dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>نوع</label>
          <select name="type" defaultValue="PERCENT" className={inputCls}>
            <option value="PERCENT">درصدی</option>
            <option value="FIXED">مبلغی (تومان)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>مقدار *</label>
          <input name="value" type="number" min="1" required className={inputCls} placeholder="مثلاً ۱۰ یا ۲۰۰۰۰۰" />
        </div>
        <div>
          <label className={labelCls}>سقف تخفیف (درصدی)</label>
          <input name="maxAmount" type="number" min="0" className={inputCls} placeholder="اختیاری" />
        </div>
        <div>
          <label className={labelCls}>حداقل مبلغ سبد</label>
          <input name="minAmount" type="number" min="0" className={inputCls} placeholder="اختیاری" />
        </div>
        <div>
          <label className={labelCls}>سقف مصرف</label>
          <input name="usageLimit" type="number" min="0" className={inputCls} placeholder="اختیاری" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>تاریخ انقضا</label>
          <input name="expiresAt" type="datetime-local" className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
        <input type="checkbox" name="active" defaultChecked className="w-4 h-4 accent-indigo-600" />
        فعال
      </label>
      {error && <div className="text-sm text-red-600 font-bold">{error}</div>}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {pending ? "..." : "ذخیره کد"}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrder, checkDiscount } from "@/app/actions";
import { toFa, toToman } from "@/lib/format";
import { TagIcon } from "@/components/icons";
import ProvinceCityFields from "@/components/province-city-fields";

export default function CheckoutForm({
  subtotal,
  isLoggedIn,
  user,
  addresses = [],
  initialCode = "",
  initialDiscount = 0,
  shippingFee = 0,
  freeShipping = false,
  freeThreshold = 0,
}: {
  subtotal: number;
  isLoggedIn: boolean;
  user: { name?: string; email?: string; phone?: string | null } | null;
  addresses?: {
    id: string;
    title: string;
    receiverName: string;
    receiverPhone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string | null;
  }[];
  initialCode?: string;
  initialDiscount?: number;
  shippingFee?: number;
  freeShipping?: boolean;
  freeThreshold?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [discountCode, setDiscountCode] = useState(initialCode);
  const [discount, setDiscount] = useState<{ ok: boolean; amount: number; description?: string; error?: string }>(
    initialDiscount > 0 ? { ok: true, amount: initialDiscount } : { ok: true, amount: 0 }
  );
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    province: "",
    city: "",
    address: "",
    note: "",
  });

  function selectAddress(addrId: string) {
    const addr = addresses.find((a) => a.id === addrId);
    if (!addr) return;
    setForm((f) => ({
      ...f,
      name: addr.receiverName,
      phone: addr.receiverPhone,
      province: addr.province,
      city: addr.city,
      address: addr.address,
    }));
  }

  function setField(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function applyCode() {
    if (!discountCode.trim()) return;
    const res = await checkDiscount(discountCode.trim(), subtotal);
    if (res.ok) setDiscount({ ok: true, amount: res.amount, description: res.description });
    else setDiscount({ ok: false, amount: 0, error: res.error });
  }

  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createOrder({
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: [form.province, form.city, form.address].filter(Boolean).join("، "),
        note: form.note,
        discountCode,
        paymentMethod,
      });
      if (res?.error) setError(res.error);
    });
  }

  const total = subtotal - (discount.ok ? discount.amount : 0) + shippingFee;
  const inputCls =
    "w-full h-11 rounded-xl border border-slate-200 px-3 text-sm bg-white transition";

  return (
    <form onSubmit={handle} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-black text-slate-800 mb-4">اطلاعات گیرنده</h2>
        {addresses.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              آدرس‌های ذخیره‌شده
            </label>
            <select
              onChange={(e) => e.target.value && selectAddress(e.target.value)}
              defaultValue=""
              className={inputCls}
            >
              <option value="">انتخاب از آدرس‌های ذخیره‌شده...</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} — {a.receiverName} — {a.province}، {a.city}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              نام و نام خانوادگی *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              required
              minLength={3}
              className={inputCls}
              placeholder="مثال: علی رضایی"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              شماره موبایل *
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              required
              pattern="09[0-9]{9}"
              className={inputCls}
              placeholder="مثال: 09121234567"
              dir="ltr"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">ایمیل</label>
            <input
              name="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              type="email"
              className={inputCls}
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>
          <ProvinceCityFields
            province={form.province}
            city={form.city}
            onChange={(province, city) =>
              setForm((f) => ({ ...f, province, city }))
            }
          />
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">آدرس (خیابان، کوچه، پلاک، واحد)</label>
            <textarea
              name="address"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              rows={2}
              className={`${inputCls} h-auto py-2.5 resize-none`}
              placeholder="مثال: خیابان ولیعصر، کوچه نارنج، پلاک ۱۲، واحد ۵"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">توضیحات سفارش</label>
            <input
              name="note"
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
              className={inputCls}
              placeholder="مثلاً: تحویل بعد از ساعت ۶ عصر"
            />
          </div>
        </div>
      </div>

      {/* کد تخفیف */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-black text-slate-800 mb-3 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-indigo-600" /> کد تخفیف
        </h2>
        <div className="flex gap-2">
          <input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className={inputCls}
            placeholder="کد تخفیف خود را وارد کنید"
          />
          <button
            type="button"
            onClick={applyCode}
            className="h-11 px-5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition shrink-0"
          >
            اعمال
          </button>
        </div>
        {discount.ok && discount.amount > 0 && (
          <div className="text-sm text-emerald-600 font-bold mt-2">
            {discount.description} اعمال شد: {toToman(discount.amount)}
          </div>
        )}
        {!discount.ok && discount.error && (
          <div className="text-sm text-red-600 mt-2">{discount.error}</div>
        )}
      </div>

      {/* روش پرداخت */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-black text-slate-800 mb-3">روش پرداخت</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod("online")}
            className={`rounded-xl border-2 p-4 text-right transition ${
              paymentMethod === "online"
                ? "border-indigo-600 bg-indigo-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="font-bold text-sm text-slate-800">پرداخت آنلاین</div>
            <div className="text-xs text-slate-500 mt-1">
              پرداخت با درگاه بانکی (در حال حاضر آزمایشی)
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("cod")}
            className={`rounded-xl border-2 p-4 text-right transition ${
              paymentMethod === "cod"
                ? "border-indigo-600 bg-indigo-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="font-bold text-sm text-slate-800">پرداخت در محل</div>
            <div className="text-xs text-slate-500 mt-1">
              پرداخت هنگام تحویل سفارش (نقدی)
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky bottom-4 shadow-lg">
        <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
          <span>جمع سفارش</span>
          <span>{toToman(subtotal)}</span>
        </div>
        {discount.ok && discount.amount > 0 && (
          <div className="flex items-center justify-between mb-1 text-sm text-emerald-600">
            <span>تخفیف</span>
            <span>− {toToman(discount.amount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
          <span>هزینه ارسال</span>
          {freeShipping ? (
            <span className="text-emerald-600 font-bold">رایگان</span>
          ) : (
            <span className="font-bold text-slate-800">{toToman(shippingFee)}</span>
          )}
        </div>
        {!freeShipping && freeThreshold > 0 && (
          <div className="text-[11px] text-slate-400 mb-1">
            {toToman(Math.max(0, freeThreshold - subtotal))} دیگر بخرید تا ارسال رایگان شود
          </div>
        )}
        <div className="border-t border-dashed border-slate-200 my-3" />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-black text-slate-800">مبلغ قابل پرداخت</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {paymentMethod === "cod" ? "در محل تحویل" : "پرداخت آنلاین"}
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700">{toToman(total)}</div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full h-12 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-60"
        >
          {pending
            ? "در حال ثبت سفارش..."
            : paymentMethod === "online"
              ? "ثبت سفارش و پرداخت"
              : "ثبت سفارش"}
        </button>
      </div>
    </form>
  );
}

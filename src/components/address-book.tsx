"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAddress, deleteAddress, setDefaultAddress } from "@/app/actions";
import { MapPinIcon, PlusIcon, XIcon, EditIcon, TrashIcon, CheckIcon } from "@/components/icons";

type AddressInput = {
  id?: string;
  title: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
};

const inputCls =
  "w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:border-indigo-400 focus:outline-none";

export default function AddressBook({
  addresses,
}: {
  addresses: AddressInput[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AddressInput | "new" | null>(null);

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await saveAddress(formData);
      if (res?.error) setError(res.error);
      else {
        setEditing(null);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    if (!confirm("آیا از حذف این آدرس مطمئن هستید؟")) return;
    startTransition(async () => {
      await deleteAddress(id);
      router.refresh();
    });
  }

  function setDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <MapPinIcon className="w-7 h-7 text-indigo-600" /> آدرس‌ها
        </h1>
        <button
          type="button"
          onClick={() => {
            setError("");
            setEditing("new");
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-4 h-4" /> افزودن آدرس
        </button>
      </div>

      {editing && (
        <form
          action={submit}
          className="bg-white rounded-2xl border-2 border-indigo-200 p-5 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800">
              {editing === "new" ? "افزودن آدرس جدید" : "ویرایش آدرس"}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="بستن"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">عنوان آدرس *</label>
              <input
                name="title"
                defaultValue={editing !== "new" ? editing.title : ""}
                required
                className={inputCls}
                placeholder="مثلاً: خانه، محل کار"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">نام گیرنده *</label>
              <input
                name="receiverName"
                defaultValue={editing !== "new" ? editing.receiverName : ""}
                required
                className={inputCls}
                placeholder="مثال: علی رضایی"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">شماره موبایل *</label>
              <input
                name="receiverPhone"
                defaultValue={editing !== "new" ? editing.receiverPhone : ""}
                required
                pattern="09[0-9]{9}"
                className={inputCls}
                placeholder="09121234567"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">کد پستی</label>
              <input
                name="postalCode"
                defaultValue={editing !== "new" ? editing.postalCode : ""}
                className={inputCls}
                placeholder="10 رقم"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">استان *</label>
              <input
                name="province"
                defaultValue={editing !== "new" ? editing.province : ""}
                required
                className={inputCls}
                placeholder="مثال: تهران"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">شهر *</label>
              <input
                name="city"
                defaultValue={editing !== "new" ? editing.city : ""}
                required
                className={inputCls}
                placeholder="مثال: تهران"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">آدرس کامل *</label>
              <textarea
                name="address"
                defaultValue={editing !== "new" ? editing.address : ""}
                required
                rows={2}
                className={`${inputCls} h-auto py-2.5 resize-none`}
                placeholder="خیابان، کوچه، پلاک، واحد"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mt-4 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={editing !== "new" ? editing.isDefault : false}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="font-bold">آدرس پیش‌فرض</span>
          </label>

          {error && <p className="text-sm text-red-600 font-bold mt-3">{error}</p>}

          <div className="flex gap-2 mt-5">
            <button
              type="submit"
              disabled={pending}
              className="px-5 h-10 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {pending ? "در حال ذخیره..." : "ذخیره آدرس"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-5 h-10 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
            >
              انصراف
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !editing ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">هنوز آدرسی ثبت نکرده‌اید</p>
          <p className="text-xs text-slate-400 mt-2">
            با افزودن آدرس، فرآیند تسویه سریع‌تر انجام می‌شود
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-2xl border p-5 ${
                a.isDefault ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-800">{a.title}</span>
                  {a.isDefault && (
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold">
                      پیش‌فرض
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setEditing(a);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                    aria-label="ویرایش"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id!)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                    aria-label="حذف"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-slate-600 space-y-1.5">
                <div className="font-bold">
                  {a.receiverName} <span className="text-slate-400 font-normal" dir="ltr">({a.receiverPhone})</span>
                </div>
                <div className="text-slate-500 text-xs leading-6">
                  {a.province}، {a.city}، {a.address}
                </div>
                {a.postalCode && (
                  <div className="text-xs text-slate-400" dir="ltr">کد پستی: {a.postalCode}</div>
                )}
              </div>
              {!a.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefault(a.id!)}
                  disabled={pending}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" /> انتخاب به‌عنوان پیش‌فرض
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
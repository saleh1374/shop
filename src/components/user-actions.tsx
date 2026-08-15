"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, deleteUser } from "@/app/admin/actions";
import { TrashIcon, RefreshIcon, ShieldIcon, UserIcon } from "@/components/icons";

export default function UserActions({
  userId,
  role,
}: {
  userId: string;
  role: "USER" | "ADMIN";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggleRole() {
    const next = role === "ADMIN" ? "USER" : "ADMIN";
    const msg =
      next === "ADMIN"
        ? "با تغییر نقش به ادمین، این کاربر به پنل مدیریت دسترسی کامل خواهد داشت. ادامه می‌دهید؟"
        : "با تغییر نقش به کاربر، دسترسی مدیریت این کاربر حذف می‌شود. ادامه می‌دهید؟";
    if (!confirm(msg)) return;
    setError("");
    startTransition(async () => {
      const res = await updateUserRole(userId, next);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  function remove() {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟ سفارش‌ها و نظرات او نیز حذف می‌شوند.")) return;
    setError("");
    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        type="button"
        onClick={toggleRole}
        disabled={pending}
        title={role === "ADMIN" ? "تبدیل به کاربر" : "تبدیل به ادمین"}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-50 ${
          role === "ADMIN"
            ? "text-indigo-600 hover:bg-indigo-50"
            : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
        }`}
      >
        {role === "ADMIN" ? <ShieldIcon className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        title="حذف کاربر"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
      {pending && <RefreshIcon className="w-4 h-4 text-slate-400 animate-spin" />}
      {error && <span className="text-[11px] text-red-600 font-bold">{error}</span>}
    </div>
  );
}
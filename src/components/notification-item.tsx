"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteNotification } from "@/app/actions";
import { BellIcon, TrashIcon, ChevronIcon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";

export default function NotificationItem({
  id,
  title,
  message,
  type,
  read,
  createdAt,
  orderId,
  color,
}: {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  orderId: string | null;
  color: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`bg-white rounded-2xl border p-4 flex items-start gap-3 transition ${
        read ? "border-slate-200" : "border-indigo-300 bg-indigo-50/40"
      }`}
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <BellIcon className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="font-black text-sm text-slate-800">{title}</div>
          <div className="text-[11px] text-slate-400 shrink-0">{formatDateTime(createdAt)}</div>
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-6">{message}</p>
        {orderId && (
          <Link
            href={`/account/orders/${orderId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2"
          >
            مشاهده سفارش <ChevronIcon className="w-3 h-3 rotate-180" />
          </Link>
        )}
      </div>
      <button
        onClick={() => startTransition(async () => {
          await deleteNotification(id);
          router.refresh();
        })}
        disabled={pending}
        className="text-slate-300 hover:text-red-500 transition shrink-0"
        aria-label="حذف اعلان"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
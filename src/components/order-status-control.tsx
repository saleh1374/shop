"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUS } from "@/lib/format";

export default function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      await updateOrderStatus(orderId, e.target.value);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      onChange={change}
      disabled={pending}
      className="h-10 rounded-xl border border-slate-200 px-2 text-sm font-bold bg-white disabled:opacity-60"
    >
      {Object.entries(ORDER_STATUS).map(([key, v]) => (
        <option key={key} value={key}>{v.label}</option>
      ))}
      {!ORDER_STATUS[status] && <option value={status}>{status}</option>}
    </select>
  );
}

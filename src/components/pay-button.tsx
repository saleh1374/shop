"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { payOrder } from "@/app/actions";

export default function PayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      await payOrder(orderId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="w-full h-13 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-60"
    >
      {pending ? "در حال پرداخت..." : "پرداخت آزمایشی را انجام می‌دهم"}
    </button>
  );
}

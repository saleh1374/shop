"use client";

import { useState } from "react";
import { DownloadIcon } from "@/components/icons";

type Order = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  total: number;
  status: string;
  createdAt: Date | string;
  address: string | null;
};

export default function OrdersCsvButton({ orders }: { orders: Order[] }) {
  const [downloading, setDownloading] = useState(false);

  function download() {
    setDownloading(true);

    const statusMap: Record<string, string> = {
      PENDING: "در انتظار پرداخت",
      PAID: "پرداخت شده",
      SHIPPED: "ارسال شده",
      DELIVERED: "تحویل شده",
      CANCELLED: "لغو شده",
    };

    const header = "شماره سفارش,نام مشتری,تلفن,ایمیل,مبلغ,وضعیت,تاریخ,آدرس\n";
    const rows = orders
      .map(
        (o) =>
          `#${o.orderNumber},${o.customerName},${o.customerPhone},${o.customerEmail ?? ""},${o.total},${statusMap[o.status] ?? o.status},${new Date(o.createdAt).toLocaleDateString("fa-IR")},"${(o.address ?? "").replace(/"/g, '""')}"`
      )
      .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  }

  return (
    <button
      onClick={download}
      disabled={downloading || orders.length === 0}
      className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
    >
      <DownloadIcon className="w-4 h-4" />
      {downloading ? "در حال دانلود..." : "خروجی CSV"}
    </button>
  );
}

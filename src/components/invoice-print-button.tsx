"use client";

import { PrinterIcon } from "@/components/icons";

export default function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
    >
      <PrinterIcon className="w-4 h-4" /> دانلود PDF فاکتور
    </button>
  );
}
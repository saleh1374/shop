"use client";

import { PrinterIcon } from "@/components/icons";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
    >
      <PrinterIcon className="w-4 h-4" /> چاپ فاکتور
    </button>
  );
}
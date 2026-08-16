"use client";

import { useState } from "react";

export default function TestEmailButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleTest() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("خطا در ارتباط با سرور");
    }
  }

  return (
    <div className="flex items-center gap-3 mt-3">
      <button
        type="button"
        onClick={handleTest}
        disabled={status === "loading"}
        className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-60"
      >
        {status === "loading" ? "در حال ارسال..." : "تست ارسال ایمیل"}
      </button>
      {message && (
        <span className={`text-xs font-bold ${status === "ok" ? "text-emerald-600" : "text-red-600"}`}>
          {message}
        </span>
      )}
    </div>
  );
}

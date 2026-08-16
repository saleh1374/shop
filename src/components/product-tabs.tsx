"use client";

import { useState } from "react";

export default function ProductTabs({
  description,
  specs,
}: {
  description: string | null;
  specs?: { label: string; value: string }[];
}) {
  const [activeTab, setActiveTab] = useState<"desc" | "specs">("desc");
  const tabs = [
    { id: "desc" as const, label: "توضیحات" },
    ...(specs && specs.length > 0 ? [{ id: "specs" as const, label: "مشخصات" }] : []),
  ];

  return (
    <div>
      <div className="flex border-b border-slate-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-sm font-bold transition ${
              activeTab === tab.id ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "desc" && (
        <div className="text-sm text-slate-600 leading-8 whitespace-pre-line">
          {description || "توضیحاتی برای این محصول ثبت نشده است."}
        </div>
      )}

      {activeTab === "specs" && specs && specs.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {specs.map((spec, i) => (
            <div
              key={i}
              className={`flex text-sm ${
                i % 2 === 0 ? "bg-slate-50" : "bg-white"
              }`}
            >
              <div className="w-1/3 px-4 py-2.5 text-slate-500 font-bold border-l border-slate-200">
                {spec.label}
              </div>
              <div className="w-2/3 px-4 py-2.5 text-slate-700">{spec.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

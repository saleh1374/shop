"use client";

export default function ShareButton({ name }: { name: string }) {
  return (
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share({ title: name, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
        }
      }}
      className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold flex items-center gap-1.5 hover:border-indigo-400 hover:text-indigo-600 transition"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
      </svg>
      اشتراک‌گذاری
    </button>
  );
}

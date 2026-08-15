"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/app/actions";
import { StarIcon } from "@/components/icons";
import { useState } from "react";
import { toFa } from "@/lib/format";

export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState("");

  function handle(formData: FormData) {
    startTransition(async () => {
      const res = await submitReview(formData);
      if (res.error) setError(res.error);
      else {
        setRating(0);
        setError("");
        router.refresh();
      }
    });
  }

  return (
    <form action={handle} className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-black text-slate-800 mb-4">ثبت نظر و امتیاز</h3>
      <input type="hidden" name="productId" value={productId} />

      <div className="flex items-center gap-1 mb-4" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`transition ${n <= (hover || rating) ? "text-amber-400" : "text-slate-200"}`}
          >
            <StarIcon className="w-7 h-7 fill-current" />
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
        <span className="mr-2 text-sm text-slate-500">
          {rating > 0 ? `${toFa(rating)} از ${toFa(5)}` : "امتیاز بدهید"}
        </span>
      </div>

      <textarea
        name="comment"
        rows={4}
        placeholder="نظر خود را درباره این محصول بنویسید..."
        className="w-full rounded-xl border border-slate-200 p-3 text-sm resize-none"
        required
      />
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      <button
        type="submit"
        disabled={pending || rating === 0}
        className="mt-3 h-10 px-6 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {pending ? "در حال ثبت..." : "ثبت نظر"}
      </button>
      <p className="text-xs text-slate-400 mt-2">نظر شما پس از تأیید مدیریت نمایش داده می‌شود.</p>
    </form>
  );
}

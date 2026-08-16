"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMyReview } from "@/app/actions";
import { TrashIcon } from "@/components/icons";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;
    startTransition(async () => {
      await deleteMyReview(reviewId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
      aria-label="حذف نظر"
    >
      <TrashIcon className="w-4 h-4" />
    </button>
  );
}
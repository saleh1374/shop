import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, formatDate } from "@/lib/format";
import { CommentIcon, StarIcon } from "@/components/icons";
import DeleteReviewButton from "@/components/delete-review-button";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار تأیید", color: "bg-amber-50 text-amber-600" },
  APPROVED: { label: "تأیید شده", color: "bg-emerald-50 text-emerald-600" },
  REJECTED: { label: "رد شده", color: "bg-red-50 text-red-600" },
};

export default async function MyReviewsPage() {
  const session = await requireUser();
  const reviews = await db.review.findMany({
    where: { userId: session.id },
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <CommentIcon className="w-7 h-7 text-indigo-600" /> نظرات من
      </h1>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">هنوز نظری ثبت نکرده‌اید</p>
          <Link
            href="/products"
            className="inline-block mt-4 bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const st = statusMap[r.status] ?? { label: r.status, color: "bg-slate-50 text-slate-500" };
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${r.product.slug}`}
                      className="text-sm font-black text-slate-800 hover:text-indigo-600 line-clamp-1"
                    >
                      {r.product.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex text-amber-400" dir="ltr">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <StarIcon
                            key={n}
                            className={`w-3.5 h-3.5 ${n <= r.rating ? "fill-current" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.color}`}>
                      {st.label}
                    </span>
                    <DeleteReviewButton reviewId={r.id} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-7 mt-3">{r.comment}</p>
                {r.status === "PENDING" && (
                  <p className="text-[11px] text-amber-600 mt-2 font-bold">
                    نظر شما پس از تأیید مدیریت نمایش داده می‌شود ({toFa(r.rating)} از ۵)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
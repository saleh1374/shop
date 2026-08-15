import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, formatDate } from "@/lib/format";
import { updateReviewStatus } from "@/app/admin/actions";
import DeleteButton from "@/components/admin-delete-button";
import { StarIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status ?? "PENDING";
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 15;

  const where = status !== "ALL" ? { status } : {};
  const [total, reviews] = await Promise.all([
    db.review.count({ where }),
    db.review.findMany({
      where,
      include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / perPage));

  async function approve(formData: FormData) {
    "use server";
    await updateReviewStatus(String(formData.get("id") ?? ""), String(formData.get("status") ?? ""));
  }

  const link = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/admin/reviews?${p.toString()}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-5">نظرات</h1>

      <div className="flex items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={link({ status: f })}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition ${
              status === f ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-400"
            }`}
          >
            {f === "ALL" ? "همه" : f === "PENDING" ? "در انتظار" : f === "APPROVED" ? "تأیید شده" : "رد شده"}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-bold text-slate-800">{r.user.name}</span>
                  <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                  <span className="flex text-amber-400" dir="ltr">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarIcon key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "fill-current" : "text-slate-200"}`} />
                    ))}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      r.status === "APPROVED" ? "bg-emerald-100 text-emerald-700"
                      : r.status === "REJECTED" ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.status === "APPROVED" ? "تأیید شده" : r.status === "REJECTED" ? "رد شده" : "در انتظار تأیید"}
                  </span>
                </div>
                <Link href={`/products/${r.product.slug}`} className="text-xs text-indigo-600 hover:text-indigo-800 block mb-2">
                  محصول: {r.product.name}
                </Link>
                <p className="text-sm text-slate-600 leading-7">{r.comment}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={approve} className="flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  {r.status !== "APPROVED" && (
                    <button name="status" value="APPROVED" className="h-9 px-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
                      تأیید
                    </button>
                  )}
                  {r.status !== "REJECTED" && (
                    <button name="status" value="REJECTED" className="h-9 px-3.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition">
                      رد
                    </button>
                  )}
                  {r.status !== "PENDING" && (
                    <button name="status" value="PENDING" className="h-9 px-3.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition">
                      در انتظار
                    </button>
                  )}
                </form>
                <DeleteButton id={r.id} action="review" name="نظر" />
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            نظری یافت نشد
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={link({ page: String(n) })}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                n === page ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              {toFa(n)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

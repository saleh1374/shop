import { toFa } from "@/lib/format";
import { StarIcon } from "@/components/icons";

export default function ReviewBreakdown({
  reviews,
  avgRating,
}: {
  reviews: { rating: number }[];
  avgRating: number;
}) {
  const total = reviews.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total > 0 ? (reviews.filter((r) => r.rating === star).length / total) * 100 : 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-6">
        {/* Average score */}
        <div className="text-center shrink-0">
          <div className="text-4xl font-black text-slate-900">{avgRating > 0 ? toFa(avgRating.toFixed(1)) : "—"}</div>
          <div className="flex text-amber-400 mt-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((n) => (
              <StarIcon
                key={n}
                className={`w-4 h-4 ${n <= Math.round(avgRating) ? "fill-current" : "text-slate-200"}`}
              />
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-1">{toFa(total)} نظر</div>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-3 text-center">{d.star}</span>
              <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-6 text-left">{toFa(d.count)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

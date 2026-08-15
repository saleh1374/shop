import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa, toToman, formatDate } from "@/lib/format";
import DiscountForm from "@/components/discount-form";
import DeleteButton from "@/components/admin-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const discounts = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-800 mb-5">کدهای تخفیف</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-4">کد تخفیف جدید</h2>
          <DiscountForm />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-right p-4 font-bold">کد</th>
                <th className="text-right p-4 font-bold">مقدار</th>
                <th className="text-right p-4 font-bold hidden sm:table-cell">مصرف</th>
                <th className="text-right p-4 font-bold hidden md:table-cell">انقضا</th>
                <th className="text-right p-4 font-bold">وضعیت</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => {
                const expired = d.expiresAt && d.expiresAt < new Date();
                const limitReached = d.usageLimit !== null && d.usedCount >= d.usageLimit;
                const inactive = !d.active || expired || limitReached;
                return (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <span className="font-black text-indigo-700" dir="ltr">{d.code}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {d.type === "PERCENT" ? `${toFa(d.value)}٪` : toToman(d.value)}
                    </td>
                    <td className="p-4 text-slate-500 hidden sm:table-cell">
                      {toFa(d.usedCount)}{d.usageLimit !== null ? ` / ${toFa(d.usageLimit)}` : ""}
                    </td>
                    <td className="p-4 text-slate-500 hidden md:table-cell">
                      {d.expiresAt ? formatDate(d.expiresAt) : "بدون انقضا"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${inactive ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                        {inactive ? "غیرفعال" : "فعال"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <DiscountForm discount={d} compact />
                        <DeleteButton id={d.id} action="discount" name={d.code} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {discounts.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-12">کدی ساخته نشده است</div>
          )}
        </div>
      </div>
    </div>
  );
}

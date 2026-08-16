import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa } from "@/lib/format";
import { markNotificationsRead } from "@/app/actions";
import NotificationItem from "@/components/notification-item";
import { BellIcon, CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  ORDER: "bg-indigo-50 text-indigo-600",
  STATUS: "bg-emerald-50 text-emerald-600",
  WELCOME: "bg-amber-50 text-amber-600",
  INFO: "bg-slate-100 text-slate-600",
};

export default async function NotificationsPage() {
  const session = await requireUser();
  const [notifications, unread] = await Promise.all([
    db.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.notification.count({ where: { userId: session.id, read: false } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">اعلان‌ها</h1>
        {unread > 0 && (
          <form
            action={async () => {
              "use server";
              await markNotificationsRead();
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              <CheckIcon className="w-4 h-4" /> خواندن همه ({toFa(unread)})
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          <BellIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          هنوز اعلانی ندارید. وقتی سفارش ثبت کنید یا وضعیتش تغییر کند، اینجا خبردار می‌شوید.
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              title={n.title}
              message={n.message}
              type={n.type}
              read={n.read}
              createdAt={n.createdAt.toISOString()}
              orderId={n.orderId}
              color={TYPE_STYLES[n.type] ?? TYPE_STYLES.INFO}
            />
          ))}
        </div>
      )}

      {session.role === "ADMIN" && (
        <p className="text-xs text-slate-400">
          اعلان‌های «سفارش جدید» برای مدیریت به همین صفحه می‌آیند.{" "}
          <Link href="/admin/orders" className="text-indigo-600 font-bold">مشاهده سفارش‌ها</Link>
        </p>
      )}
    </div>
  );
}
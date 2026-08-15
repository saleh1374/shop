import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import AdminNav from "@/components/admin-nav";
import { logoutUser } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-black">
              پنل مدیریت فروشگاه
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-slate-300 hover:text-white transition">
              مشاهده سایت
            </Link>
            <form action={logoutUser}>
              <button className="text-slate-300 hover:text-white transition">خروج</button>
            </form>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <AdminNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

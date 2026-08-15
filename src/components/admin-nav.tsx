"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BoxIcon,
  FolderIcon,
  TagIcon,
  CommentIcon,
  SettingsIcon,
  ChartIcon,
} from "@/components/icons";

const links = [
  { href: "/admin", label: "داشبورد", icon: HomeIcon },
  { href: "/admin/products", label: "محصولات", icon: BoxIcon },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderIcon },
  { href: "/admin/orders", label: "سفارش‌ها", icon: ChartIcon },
  { href: "/admin/discounts", label: "کد تخفیف", icon: TagIcon },
  { href: "/admin/reviews", label: "نظرات", icon: CommentIcon },
  { href: "/admin/settings", label: "تنظیمات", icon: SettingsIcon },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:w-56 shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-2 lg:sticky lg:top-4 flex lg:flex-col gap-1 overflow-x-auto">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <l.icon className="w-5 h-5" />
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

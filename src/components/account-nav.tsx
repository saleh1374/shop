"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BoxIcon,
  HeartIcon,
  MapPinIcon,
  CommentIcon,
  SettingsIcon,
  BellIcon,
} from "@/components/icons";

const links = [
  { href: "/account", label: "داشبورد", icon: HomeIcon },
  { href: "/account/orders", label: "سفارش‌های من", icon: BoxIcon },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: HeartIcon },
  { href: "/account/notifications", label: "اعلان‌ها", icon: BellIcon },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPinIcon },
  { href: "/account/reviews", label: "نظرات من", icon: CommentIcon },
  { href: "/account/profile", label: "تنظیمات پروفایل", icon: SettingsIcon },
];

export default function AccountNav({ wishlistCount, unread }: { wishlistCount: number; unread: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
      {links.map((l) => {
        const active = l.href === "/account"
          ? pathname === "/account"
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <l.icon className="w-5 h-5" />
            {l.label}
            {l.href === "/account/wishlist" && wishlistCount > 0 && (
              <span className="mr-auto min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
            {l.href === "/account/notifications" && unread > 0 && (
              <span className="mr-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ACCOUNT = ["/account/login", "/account/register", "/account/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  // صفحات عمومی حساب کاربری — نیاز به لاگین ندارن
  if (PUBLIC_ACCOUNT.includes(pathname)) {
    return NextResponse.next();
  }

  // مسیرهای ادمین فقط با توکن معتبر
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // مسیرهای حساب کاربری
  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payment")
  ) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout", "/checkout/:path*", "/payment/:path*"],
};

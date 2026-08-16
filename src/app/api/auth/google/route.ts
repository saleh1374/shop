import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-auth";
import crypto from "crypto";

export async function GET(request: Request) {
  const state = crypto.randomBytes(32).toString("hex");
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/account";

  const res = NextResponse.redirect(getGoogleAuthUrl(state));
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  res.cookies.set("google_oauth_redirect", redirectTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return res;
}

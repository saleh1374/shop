import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getGoogleUserInfo } from "@/lib/google-auth";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const store = await cookies();
  const savedState = store.get("google_oauth_state")?.value;
  const redirectTo = store.get("google_oauth_redirect")?.value || "/account";

  store.delete("google_oauth_state");
  store.delete("google_oauth_redirect");

  if (error || !code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL(`/account/login?error=google_auth_failed`, url.origin)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email_verified) {
      return NextResponse.redirect(
        new URL(`/account/login?error=email_not_verified`, url.origin)
      );
    }

    let user = await db.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email },
        ],
      },
      select: { id: true, role: true, googleId: true },
    });

    if (user) {
      if (!user.googleId) {
        await db.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.sub,
            image: googleUser.picture,
          },
        });
      }
    } else {
      user = await db.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.sub,
          image: googleUser.picture,
        },
        select: { id: true, role: true, googleId: true },
      });
    }

    await createSession(user.id, user.role);

    return NextResponse.redirect(new URL(redirectTo, url.origin));
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/account/login?error=google_auth_failed`, url.origin)
    );
  }
}

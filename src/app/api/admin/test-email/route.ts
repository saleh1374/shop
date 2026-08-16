import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST() {
  const session = await requireAdmin().catch(() => null);
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });

  try {
    const ok = await sendEmail(
      "salehkheiri@gmail.com",
      "تست ارسال ایمیل - فروشگاه نمونه",
      `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10b981; margin-bottom: 16px;">ایمیل تست با موفقیت ارسال شد ✅</h2>
          <p style="color: #475569; line-height: 1.8; font-size: 14px;">
            تنظیمات SMTP فروشگاه شما درست کار می‌کند.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
            ${new Date().toLocaleString("fa-IR")}
          </p>
        </div>
      </div>`
    );
    if (ok) {
      return NextResponse.json({ ok: true, message: "ایمیل تست با موفقیت ارسال شد" });
    }
    return NextResponse.json({ error: "SMTP تنظیم نشده یا اتصال برقرار نشد" }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: `خطا در ارسال ایمیل: ${(e as Error).message}` }, { status: 500 });
  }
}

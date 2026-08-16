import nodemailer from "nodemailer";
import { getSettings, setting } from "@/lib/settings";

let _transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (_transporter) return _transporter;
  const s = await getSettings();
  const host = setting(s, "smtp_host", "");
  const port = Number(setting(s, "smtp_port", "465"));
  const user = setting(s, "smtp_user", "");
  const pass = setting(s, "smtp_pass", "");
  if (!host || !user || !pass) return null;
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return _transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured, skipping email");
    return false;
  }
  const s = await getSettings();
  const from = setting(s, "store_email", "noreply@shop.ir");
  await transporter.sendMail({ from, to, subject, html });
  return true;
}

export function resetPasswordEmailHtml(name: string, token: string): string {
  return `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">بازیابی رمز عبور</h2>
        <p style="color: #475569; line-height: 1.8; font-size: 14px;">
          سلام <strong>${name}</strong>،
        </p>
        <p style="color: #475569; line-height: 1.8; font-size: 14px;">
          کد بازیابی رمز عبور شما:
        </p>
        <div style="background: white; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 4px; direction: ltr;">${token}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.8;">
          این کد تا ۱۵ دقیقه معتبر است. اگر درخواست بازیابی رمز نداده‌اید، این ایمیل را نادیده بگیرید.
        </p>
      </div>
    </div>
  `;
}

export function orderConfirmationHtml(name: string, orderNumber: string, total: number): string {
  return `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">ثبت سفارش موفق ✅</h2>
        <p style="color: #475569; line-height: 1.8; font-size: 14px;">
          سلام <strong>${name}</strong>،
        </p>
        <p style="color: #475569; line-height: 1.8; font-size: 14px;">
          سفارش شما با شماره <strong>#${orderNumber}</strong> ثبت شد.
        </p>
        <div style="background: white; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="color: #475569; font-size: 14px; margin: 4px 0;">شماره سفارش: <strong>#${orderNumber}</strong></p>
          <p style="color: #475569; font-size: 14px; margin: 4px 0;">مبلغ کل: <strong>${total.toLocaleString("fa-IR")} تومان</strong></p>
        </div>
      </div>
    </div>
  `;
}

export function orderStatusHtml(name: string, orderNumber: string, status: string): string {
  const statusMap: Record<string, string> = {
    PAID: "پرداخت شده ✅",
    SHIPPED: "ارسال شده 🚚",
    DELIVERED: "تحویل شده ✅",
    CANCELLED: "لغو شده ❌",
  };
  return `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">تغییر وضعیت سفارش</h2>
        <p style="color: #475569; line-height: 1.8; font-size: 14px;">
          سلام <strong>${name}</strong>،
        </p>
        <p style="color: #475569; line-height: 1.8; font-size: 14px;">
          وضعیت سفارش <strong>#${orderNumber}</strong> به <strong>${statusMap[status] ?? status}</strong> تغییر کرد.
        </p>
      </div>
    </div>
  `;
}

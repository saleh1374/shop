import { db } from "@/lib/db";
import { sendEmail, orderConfirmationHtml, orderStatusHtml } from "@/lib/email";

export async function notify(
  userId: string,
  title: string,
  message: string,
  type = "INFO",
  orderId: string | null = null
) {
  await db.notification.create({ data: { userId, title, message, type, orderId } });

  // ارسال ایمیل
  if (orderId && (type === "STATUS" || type === "ORDER")) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user?.email) {
      const order = await db.order.findUnique({ where: { id: orderId }, select: { orderNumber: true, status: true, total: true } });
      if (order) {
        const subject = type === "ORDER" ? `ثبت سفارش #${order.orderNumber}` : `تغییر وضعیت سفارش #${order.orderNumber}`;
        const html = type === "ORDER"
          ? orderConfirmationHtml(user.name, order.orderNumber, order.total)
          : orderStatusHtml(user.name, order.orderNumber, order.status);
        await sendEmail(user.email, subject, html);
      }
    }
  }
}

export async function notifyAdmins(title: string, message: string, type = "INFO", orderId: string | null = null) {
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await db.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, title, message, type, orderId })),
  });
}
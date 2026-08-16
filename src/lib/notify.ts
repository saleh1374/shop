import { db } from "@/lib/db";

export async function notify(
  userId: string,
  title: string,
  message: string,
  type = "INFO",
  orderId: string | null = null
) {
  await db.notification.create({ data: { userId, title, message, type, orderId } });
}

export async function notifyAdmins(title: string, message: string, type = "INFO", orderId: string | null = null) {
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await db.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, title, message, type, orderId })),
  });
}
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, getSession } from "@/lib/auth";
import { toSlug } from "@/lib/format";
import { setSetting } from "@/lib/settings";
import { notify } from "@/lib/notify";
import type { OrderStatus } from "@/generated/prisma/enums";

async function guard() {
  await requireAdmin();
}

// ---------------- محصولات ----------------

export type ProductInput = {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  salePrice: string;
  stock: number;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: string[];
};

export async function saveProduct(input: ProductInput) {
  await guard();
  const schema = z.object({
    name: z.string().min(2, "نام محصول حداقل ۲ حرف باشد"),
    price: z.number().int().positive("قیمت معتبر نیست"),
    stock: z.number().int().min(0),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا" };

  const slug = toSlug(input.slug ?? input.name);
  const salePrice = Number(input.salePrice) || null;
  const data = {
    name: input.name,
    slug,
    description: input.description || null,
    price: input.price,
    salePrice: salePrice && salePrice < input.price ? salePrice : null,
    stock: input.stock,
    categoryId: input.categoryId || null,
    featured: input.featured,
    active: input.active,
  };

  if (input.id) {
    const existing = await db.product.findUnique({ where: { id: input.id } });
    if (!existing) return { error: "محصول یافت نشد" };
    await db.$transaction(async (tx) => {
      await tx.product.update({ where: { id: input.id }, data });
      await tx.productImage.deleteMany({ where: { productId: input.id } });
      if (input.images.length > 0) {
        await tx.productImage.createMany({
          data: input.images.map((url, i) => ({ url, productId: input.id!, sortOrder: i })),
        });
      }
    });
  } else {
    await db.$transaction(async (tx) => {
      const product = await tx.product.create({ data });
      if (input.images.length > 0) {
        await tx.productImage.createMany({
          data: input.images.map((url, i) => ({ url, productId: product.id, sortOrder: i })),
        });
      }
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  await guard();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- دسته‌بندی ----------------

export async function saveCategory(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "") || null;
  const image = String(formData.get("image") ?? "").trim();

  if (name.length < 2) return { error: "نام دسته حداقل ۲ حرف باشد" };
  const slug = toSlug(name);
  if (id) {
    if (parentId === id) return { error: "دسته نمی‌تواند فرزند خودش باشد" };
    await db.category.update({ where: { id }, data: { name, slug, parentId, image: image || null } });
  } else {
    await db.category.create({ data: { name, slug, parentId, image: image || null } });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  await guard();
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- سفارش‌ها ----------------

export async function updateOrderStatus(orderId: string, status: string) {
  await guard();
  const allowed: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(status as OrderStatus)) return { error: "وضعیت نامعتبر است" };
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "سفارش یافت نشد" };
  await db.order.update({ where: { id: orderId }, data: { status: status as OrderStatus } });
  if (order.userId) {
    const labels: Record<string, string> = {
      PENDING: "در انتظار پرداخت",
      PAID: "پرداخت شده",
      SHIPPED: "ارسال شده 🚚",
      DELIVERED: "تحویل شده ✅",
      CANCELLED: "لغو شده",
    };
    await notify(
      order.userId,
      "به‌روزرسانی سفارش 📦",
      `وضعیت سفارش #${order.orderNumber} به «${labels[status] ?? status}» تغییر کرد.`,
      "STATUS",
      order.id
    );
  }
  revalidatePath("/admin/orders");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- کد تخفیف ----------------

export type DiscountInput = {
  id?: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxAmount: string;
  minAmount: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
};

export async function saveDiscount(input: DiscountInput) {
  await guard();
  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,30}$/.test(code)) return { error: "کد تخفیف نامعتبر است (حروف انگلیسی و عدد، حداقل ۳ کاراکتر)" };
  if (input.value <= 0) return { error: "مقدار تخفیف باید بیشتر از صفر باشد" };
  if (input.type === "PERCENT" && input.value > 100) return { error: "درصد تخفیف حداکثر ۱۰۰ است" };

  const data = {
    code,
    type: input.type,
    value: input.value,
    maxAmount: Number(input.maxAmount) || null,
    minAmount: Number(input.minAmount) || null,
    usageLimit: Number(input.usageLimit) || null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    active: input.active,
  };

  if (input.id) {
    await db.discountCode.update({ where: { id: input.id }, data });
  } else {
    await db.discountCode.create({ data });
  }
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function deleteDiscount(id: string) {
  await guard();
  await db.discountCode.delete({ where: { id } });
  revalidatePath("/admin/discounts");
  return { ok: true };
}

// ---------------- نظرات ----------------

export async function updateReviewStatus(id: string, status: string) {
  await guard();
  const allowed = ["PENDING", "APPROVED", "REJECTED"];
  if (!allowed.includes(status)) return { error: "وضعیت نامعتبر است" };
  await db.review.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteReview(id: string) {
  await guard();
  await db.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- تنظیمات ----------------

export async function saveSettings(formData: FormData) {
  await guard();
  const keys = [
    "store_name",
    "store_description",
    "store_url",
    "store_email",
    "phone",
    "email",
    "address",
    "instagram",
    "telegram",
    "enamad_code",
    "zarinpal_merchant",
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_pass",
  ];
  for (const key of keys) {
    await setSetting(key, String(formData.get(key) ?? ""));
  }
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function deleteAllData() {
  await guard();
  await db.$transaction([
    db.orderItem.deleteMany(),
    db.order.deleteMany(),
    db.cartItem.deleteMany(),
    db.review.deleteMany(),
    db.productImage.deleteMany(),
    db.product.deleteMany(),
    db.category.deleteMany(),
    db.discountCode.deleteMany(),
  ]);
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- کاربران ----------------

export async function updateUserRole(userId: string, role: string) {
  await guard();
  const admin = await getSession();
  if (!admin || admin.id === userId) return { error: "نمی‌توانید نقش خودتان را تغییر دهید" };
  if (role !== "USER" && role !== "ADMIN") return { error: "نقش نامعتبر است" };
  await db.user.update({ where: { id: userId }, data: { role: role as "USER" | "ADMIN" } });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(userId: string) {
  await guard();
  const admin = await getSession();
  if (!admin || admin.id === userId) return { error: "نمی‌توانید خودتان را حذف کنید" };
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "کاربر یافت نشد" };
  if (user.role === "ADMIN") return { error: "کاربر ادمین قابل حذف نیست" };
  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { ok: true };
}

// ---------------- عملیات دسته‌ای ----------------

export async function bulkDeleteProducts(ids: string[]) {
  await guard();
  if (!ids.length || ids.length > 100) return { error: "تعداد آیتم‌ها نامعتبر است" };
  await db.product.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkToggleProducts(ids: string[], active: boolean) {
  await guard();
  if (!ids.length || ids.length > 100) return { error: "تعداد آیتم‌ها نامعتبر است" };
  await db.product.updateMany({ where: { id: { in: ids } }, data: { active } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkUpdateOrderStatus(ids: string[], status: string) {
  await guard();
  const allowed: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(status as OrderStatus)) return { error: "وضعیت نامعتبر است" };
  if (!ids.length || ids.length > 100) return { error: "تعداد آیتم‌ها نامعتبر است" };
  await db.order.updateMany({ where: { id: { in: ids } }, data: { status: status as OrderStatus } });
  revalidatePath("/admin/orders");
  return { ok: true };
}

// ---------------- لغو خودکار سفارشات معلول ----------------

const COD_CANCEL_HOURS = 24;

export async function cancelStaleCodOrders() {
  await guard();
  const cutoff = new Date(Date.now() - COD_CANCEL_HOURS * 60 * 60 * 1000);
  const staleOrders = await db.order.findMany({
    where: {
      status: "PENDING",
      paymentGateway: "cod",
      createdAt: { lt: cutoff },
    },
    include: { items: true },
  });

  for (const order of staleOrders) {
    await db.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });
    if (order.userId) {
      await notify(order.userId, "سفارش لغو شد ❌", `سفارش #${order.orderNumber} به دلیل عدم تأیید ظرف ${COD_CANCEL_HOURS} ساعت لغو شد.`, "STATUS", order.id);
    }
  }
  revalidatePath("/admin/orders");
  return { ok: true, cancelled: staleOrders.length };
}

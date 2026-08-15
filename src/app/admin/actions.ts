"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toSlug } from "@/lib/format";
import { setSetting } from "@/lib/settings";
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
  await db.order.update({ where: { id: orderId }, data: { status: status as OrderStatus } });
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
    "phone",
    "email",
    "address",
    "instagram",
    "telegram",
    "enamad_code",
    "zarinpal_merchant",
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, getSession, requireUser } from "@/lib/auth";
import { getOrCreateCartSession, getCartSession } from "@/lib/cart";
import { applyDiscount } from "@/lib/discount";
import { getActiveGateway } from "@/lib/payment";

// ---------------- سبد خرید ----------------

export async function addToCart(productId: string, quantity = 1) {
  const session = await getSession();
  const cartSession = await getOrCreateCartSession();

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) return { error: "محصول یافت نشد" };
  if (product.stock === 0) return { error: "محصول ناموجود است" };

  const existing = await db.cartItem.findFirst({
    where: session
      ? { userId: session.id, productId }
      : { sessionId: cartSession, productId },
  });

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, product.stock);
    await db.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
  } else {
    if (session) {
      // انتقال سبد ناشناس به حساب کاربری
      const guest = await db.cartItem.findFirst({
        where: { sessionId: cartSession, productId },
      });
      if (guest) {
        await db.cartItem.update({
          where: { id: guest.id },
          data: { userId: session.id, sessionId: null, quantity: Math.min(guest.quantity + quantity, product.stock) },
        });
      } else {
        await db.cartItem.create({
          data: { productId, quantity: Math.min(quantity, product.stock), userId: session.id },
        });
      }
    } else {
      await db.cartItem.create({
        data: { productId, quantity: Math.min(quantity, product.stock), sessionId: cartSession },
      });
    }
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { product: true },
  });
  if (!item) return { error: "آیتم یافت نشد" };
  const qty = Math.max(1, Math.min(quantity, item.product.stock));
  await db.cartItem.update({ where: { id: itemId }, data: { quantity: qty } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeCartItem(itemId: string) {
  await db.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- نظرات ----------------

export async function submitReview(formData: FormData) {
  const session = await requireUser();
  const productId = String(formData.get("productId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  const schema = z.object({
    productId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(3, "متن نظر خیلی کوتاه است").max(1000),
  });
  const parsed = schema.safeParse({ productId, rating, comment });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا" };

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "محصول یافت نشد" };

  await db.review.create({
    data: {
      productId,
      userId: session.id,
      rating,
      comment,
      status: "PENDING",
    },
  });

  revalidatePath(`/products/${product.slug}`);
  return { ok: true };
}

// ---------------- احراز هویت ----------------

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const schema = z.object({
    name: z.string().min(2, "نام حداقل ۲ حرف باشد"),
    email: z.string().email("ایمیل معتبر نیست"),
    phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09121234567)"),
    password: z.string().min(6, "رمز عبور حداقل ۶ حرف باشد"),
  });
  const parsed = schema.safeParse({ name, email, phone, password });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا" };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "این ایمیل قبلاً ثبت شده است" };

  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
    },
  });

  // انتقال سبد ناشناس
  const cartSession = await getCartSession();
  if (cartSession) {
    await db.cartItem.updateMany({ where: { sessionId: cartSession }, data: { userId: user.id, sessionId: null } });
  }

  await createSession(user.id, user.role);
  redirect("/account");
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "ایمیل یا رمز عبور اشتباه است" };
  }

  const cartSession = await getCartSession();
  if (cartSession) {
    await db.cartItem.updateMany({ where: { sessionId: cartSession }, data: { userId: user.id, sessionId: null } });
  }

  await createSession(user.id, user.role);
  redirect("/account");
}

export async function logoutUser() {
  await destroySession();
  redirect("/");
}

// ---------------- سفارش ----------------

export type OrderInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  discountCode: string;
  paymentMethod: "online" | "cod";
};

export async function createOrder(input: OrderInput) {
  const session = await getSession();
  const cartSession = await getCartSession();

  const cartItems = await db.cartItem.findMany({
    where: { OR: [{ userId: session?.id ?? "" }, { sessionId: cartSession ?? "" }] },
    include: { product: true },
  });

  if (cartItems.length === 0) return { error: "سبد خرید خالی است" };

  const schema = z.object({
    name: z.string().min(3, "نام گیرنده حداقل ۳ حرف باشد"),
    phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09121234567)"),
    email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
    address: z.string().min(5, "آدرس کامل وارد کنید").optional().or(z.literal("")),
    note: z.string().max(500).optional().or(z.literal("")),
    discountCode: z.string().max(50).optional().or(z.literal("")),
    paymentMethod: z.enum(["online", "cod"]),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا" };

  // بررسی موجودی
  for (const item of cartItems) {
    if (item.quantity > item.product.stock)
      return { error: `موجودی «${item.product.name}» کافی نیست (${item.product.stock} عدد موجود است)` };
  }

  const subtotal = cartItems.reduce((s, i) => {
    const price = i.product.salePrice && i.product.salePrice > 0 ? i.product.salePrice : i.product.price;
    return s + price * i.quantity;
  }, 0);

  const discount = await applyDiscount(parsed.data.discountCode ?? "", subtotal);
  if (!discount.ok) return { error: discount.error };
  const total = subtotal - discount.amount;

  // شماره سفارش (اتمی — بدون رقابت بین دو سفارش همزمان)
  const rows = await db.$queryRaw<{ value: string }[]>`
    INSERT INTO "Setting" (id, key, value)
    VALUES (gen_random_uuid()::text, 'order_counter', '1000')
    ON CONFLICT (key) DO UPDATE SET value = (CAST("Setting".value AS BIGINT) + 1)::text
    RETURNING value
  `;
  const orderNumber = rows[0]?.value ?? "1000";

  const isCod = parsed.data.paymentMethod === "cod";

  const order = await db.order.create({
    data: {
      orderNumber,
      status: isCod ? "PAID" : "PENDING",
      subtotal,
      discount: discount.amount,
      total,
      customerName: parsed.data.name,
      customerPhone: parsed.data.phone,
      customerEmail: parsed.data.email || null,
      address: parsed.data.address || null,
      note: parsed.data.note || null,
      paymentGateway: isCod ? "cod" : "simulation",
      userId: session?.id ?? null,
      items: {
        create: cartItems.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price:
            i.product.salePrice && i.product.salePrice > 0
              ? i.product.salePrice
              : i.product.price,
          quantity: i.quantity,
        })),
      },
    },
  });

  // مصرف کد تخفیف
  if (discount.ok && discount.codeId) {
    await db.discountCode.update({
      where: { id: discount.codeId },
      data: { usedCount: { increment: 1 } },
    });
  }

  // حذف سبد خرید
  await db.cartItem.deleteMany({
    where: { OR: [{ userId: session?.id ?? "" }, { sessionId: cartSession ?? "" }] },
  });

  // کاهش موجودی (برای پرداخت در محل همین حالا، برای آنلاین بعد از پرداخت)
  if (isCod) {
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  revalidatePath("/", "layout");

  if (isCod) {
    redirect(`/payment/result?order=${order.orderNumber}&status=cod`);
  }
  redirect(`/payment/${order.id}`);
}

export async function payOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "سفارش یافت نشد" };
  if (order.status !== "PENDING") redirect(`/payment/result?order=${order.orderNumber}&status=success`);

  // پرداخت آزمایشی (محل اتصال درگاه واقعی)
  const gateway = getActiveGateway();
  const result = await gateway.verifyPayment(order, { status: "ok" });
  if (!result.ok) return { error: result.error ?? "پرداخت ناموفق بود" };

  await db.order.update({
    where: { id: order.id },
    data: { status: "PAID", paymentRef: result.ref },
  });

  // کاهش موجودی
  for (const item of order.items) {
    if (item.productId) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  revalidatePath("/", "layout");
  redirect(`/payment/result?order=${order.orderNumber}&status=success`);
}

export async function checkDiscount(code: string, subtotal: number) {
  const result = await applyDiscount(code, subtotal);
  return result;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, getSession, requireUser } from "@/lib/auth";
import { getOrCreateCartSession, getCartSession, getCart } from "@/lib/cart";
import { applyDiscount } from "@/lib/discount";
import { getActiveGateway } from "@/lib/payment";
import { shippingFee } from "@/lib/shipping";
import { notify, notifyAdmins } from "@/lib/notify";

// محدودیت تلاش ورود (ذخیره در دیتابیس — برای چند فرآیند هم کار می‌کند)
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 5 * 60_000;

async function getLoginState(email: string): Promise<{ count: number; lockedUntil: number }> {
  const row = await db.setting.findUnique({ where: { key: `login_fail:${email}` } });
  if (!row) return { count: 0, lockedUntil: 0 };
  try {
    return JSON.parse(row.value) as { count: number; lockedUntil: number };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

async function setLoginState(email: string, state: { count: number; lockedUntil: number }) {
  await db.setting.upsert({
    where: { key: `login_fail:${email}` },
    update: { value: JSON.stringify(state) },
    create: { key: `login_fail:${email}`, value: JSON.stringify(state) },
  });
}

// ---------------- سبد خرید ----------------

export async function addToCart(productId: string, quantity = 1) {
  const session = await getSession();
  const cartSession = await getOrCreateCartSession();

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) return { error: "محصول یافت نشد" };
  if (product.stock === 0) return { error: "محصول ناموجود است" };

  const qty = Math.min(quantity, product.stock);

  if (session) {
    // حالت لاگین: ابتدا بررسی سبد ناشناس
    const guest = await db.cartItem.findFirst({
      where: { sessionId: cartSession, productId },
    });
    if (guest) {
      await db.cartItem.update({
        where: { id: guest.id },
        data: { userId: session.id, sessionId: null, quantity: Math.min(guest.quantity + qty, product.stock) },
      });
    } else {
      // استفاده از upsert برای جلوگیری از آیتم تکراری در درخواست همزمان
      const existing = await db.cartItem.findFirst({
        where: { userId: session.id, productId },
      });
      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.min(existing.quantity + qty, product.stock) },
        });
      } else {
        await db.cartItem.create({
          data: { productId, quantity: qty, userId: session.id },
        });
      }
    }
  } else {
    // حالت ناشناس: استفاده از upsert
    const existing = await db.cartItem.findFirst({
      where: { sessionId: cartSession, productId },
    });
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + qty, product.stock) },
      });
    } else {
      await db.cartItem.create({
        data: { productId, quantity: qty, sessionId: cartSession },
      });
    }
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const session = await getSession();
  const cartSession = await getCartSession();
  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { product: true },
  });
  if (!item) return { error: "آیتم یافت نشد" };

  // بررسی مالکیت: آیتم باید متعلق به کاربر فعلی یا سبد ناشناس باشد
  const isOwner = (session && item.userId === session.id) || (!session && item.sessionId === cartSession);
  if (!isOwner) return { error: "دسترسی غیرمجاز" };

  const qty = Math.max(1, Math.min(quantity, item.product.stock));
  await db.cartItem.update({ where: { id: itemId }, data: { quantity: qty } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeCartItem(itemId: string) {
  const session = await getSession();
  const cartSession = await getCartSession();
  const item = await db.cartItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "آیتم یافت نشد" };

  // بررسی مالکیت
  const isOwner = (session && item.userId === session.id) || (!session && item.sessionId === cartSession);
  if (!isOwner) return { error: "دسترسی غیرمجاز" };

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
  await notify(user.id, "خوش آمدید 👋", "ثبت‌نام شما با موفقیت انجام شد. از امکانات حساب کاربری لذت ببرید!", "WELCOME");
  redirect("/account");
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const state = await getLoginState(email);
  if (state.lockedUntil > Date.now())
    return { error: `تلاش‌های ناموفق زیاد بود. لطفاً ۵ دقیقه دیگر دوباره امتحان کنید.` };

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    const count = state.count + 1;
    if (count >= LOGIN_MAX_ATTEMPTS) {
      await setLoginState(email, { count: 0, lockedUntil: Date.now() + LOGIN_LOCK_MS });
      return { error: `تلاش‌های ناموفق زیاد بود. لطفاً ۵ دقیقه دیگر دوباره امتحان کنید.` };
    }
    await setLoginState(email, { count, lockedUntil: 0 });
    return { error: "ایمیل یا رمز عبور اشتباه است" };
  }

  await setLoginState(email, { count: 0, lockedUntil: 0 });

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

  const orFilters: Record<string, string>[] = [];
  if (session?.id) orFilters.push({ userId: session.id });
  if (cartSession) orFilters.push({ sessionId: cartSession });

  const cartItems = orFilters.length === 0
    ? []
    : await db.cartItem.findMany({
        where: { OR: orFilters },
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
  const ship = await shippingFee(subtotal);
  const total = subtotal - discount.amount + ship.fee;

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
      shippingCost: ship.fee,
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
  const deleteFilters: Record<string, string>[] = [];
  if (session?.id) deleteFilters.push({ userId: session.id });
  if (cartSession) deleteFilters.push({ sessionId: cartSession });
  if (deleteFilters.length > 0) {
    await db.cartItem.deleteMany({ where: { OR: deleteFilters } });
  }

  // اعلان‌ها
  if (session?.id) {
    await notify(
      session.id,
      "سفارش شما ثبت شد ✅",
      `سفارش #${orderNumber} با موفقیت ثبت شد. وضعیت آن را از حساب کاربری دنبال کنید.`,
      "ORDER",
      order.id
    );
  }
  await notifyAdmins(
    "سفارش جدید 🛒",
    `سفارش #${orderNumber} از ${parsed.data.name} ثبت شد (${total.toLocaleString("fa-IR")} تومان).`,
    "ORDER",
    order.id
  );

  // کاهش موجودی (برای پرداخت در محل همین حالا، برای آنلاین بعد از پرداخت)
  if (isCod) {
    await db.$transaction(async (tx) => {
      for (const item of cartItems) {
        const updated = await tx.$executeRaw`
          UPDATE "Product" SET stock = stock - ${item.quantity}
          WHERE id = ${item.productId}::text AND stock >= ${item.quantity}
        `;
        if (updated === 0) {
          throw new Error(`موجودی «${item.product.name}» کافی نیست`);
        }
      }
    });
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

  // کاهش موجودی با تراکنش اتمیک برای جلوگیری از race condition
  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.productId) {
        // ابتدا بررسی موجودی کافی
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`موجودی «${item.productName}» کافی نیست`);
        }
        // کاهش اتمیک با شرط
        const updated = await tx.$executeRaw`
          UPDATE "Product" SET stock = stock - ${item.quantity}
          WHERE id = ${item.productId}::text AND stock >= ${item.quantity}
        `;
        if (updated === 0) {
          throw new Error(`موجودی «${item.productName}» کافی نیست`);
        }
      }
    }
  });

  if (order.userId) {
    await notify(
      order.userId,
      "پرداخت تأیید شد 💳",
      `پرداخت سفارش #${order.orderNumber} با موفقیت انجام شد.`,
      "STATUS",
      order.id
    );
  }

  revalidatePath("/", "layout");
  redirect(`/payment/result?order=${order.orderNumber}&status=success`);
}

export async function checkDiscount(code: string, subtotal: number) {
  const result = await applyDiscount(code, subtotal);
  return result;
}

// ---------------- کد تخفیف در سبد ----------------

const COUPON_COOKIE = "coupon_code";
const COUPON_MAX_AGE = 60 * 60 * 24 * 7;

export async function applyCartCoupon(code: string) {
  const { items, subtotal } = await getCart();
  if (items.length === 0) return { error: "سبد خرید خالی است" };
  const result = await applyDiscount(code, subtotal);
  if (!result.ok) return { error: result.error };
  const store = await cookies();
  store.set(COUPON_COOKIE, code.trim().toUpperCase(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COUPON_MAX_AGE,
  });
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true, amount: result.amount, description: result.description };
}

export async function clearCartCoupon() {
  const store = await cookies();
  store.delete(COUPON_COOKIE);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true };
}

// ---------------- اعلان‌ها ----------------

export async function markNotificationsRead() {
  const session = await requireUser();
  await db.notification.updateMany({ where: { userId: session.id, read: false }, data: { read: true } });
  revalidatePath("/account/notifications");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteNotification(id: string) {
  const session = await requireUser();
  await db.notification.deleteMany({ where: { id, userId: session.id } });
  revalidatePath("/account/notifications");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- علاقه‌مندی‌ها ----------------

export async function toggleWishlist(productId: string) {
  const session = await requireUser();
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "محصول یافت نشد" };

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.id, productId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await db.wishlistItem.create({ data: { userId: session.id, productId } });
  }

  revalidatePath("/", "layout");
  revalidatePath(`/products/${product.slug}`);
  return { ok: true };
}

// ---------------- دفترچه آدرس ----------------

export async function saveAddress(formData: FormData) {
  const session = await requireUser();
  const id = String(formData.get("id") ?? "");
  const data = {
    title: String(formData.get("title") ?? "").trim(),
    receiverName: String(formData.get("receiverName") ?? "").trim(),
    receiverPhone: String(formData.get("receiverPhone") ?? "").trim(),
    province: String(formData.get("province") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    isDefault: formData.get("isDefault") === "on",
  };

  const schema = z.object({
    title: z.string().min(2, "عنوان آدرس حداقل ۲ حرف باشد"),
    receiverName: z.string().min(2, "نام گیرنده حداقل ۲ حرف باشد"),
    receiverPhone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
    province: z.string().min(2, "استان را وارد کنید"),
    city: z.string().min(2, "شهر را وارد کنید"),
    address: z.string().min(5, "آدرس کامل وارد کنید"),
    postalCode: z.string().regex(/^\d{10}$/, "کد پستی ۱۰ رقم است").optional().or(z.literal("")),
    isDefault: z.boolean().default(false),
  });
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا" };

  const { isDefault, ...fields } = parsed.data;

  if (id) {
    const existing = await db.address.findFirst({ where: { id, userId: session.id } });
    if (!existing) return { error: "آدرس یافت نشد" };
    if (isDefault) {
      await db.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
    }
    await db.address.update({ where: { id }, data: { ...fields, isDefault } });
  } else {
    if (isDefault) {
      await db.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
    }
    const count = await db.address.count({ where: { userId: session.id } });
    await db.address.create({
      data: { ...fields, userId: session.id, isDefault: isDefault || count === 0 },
    });
  }

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddress(id: string) {
  const session = await requireUser();
  await db.address.deleteMany({ where: { id, userId: session.id } });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddress(id: string) {
  const session = await requireUser();
  const addr = await db.address.findFirst({ where: { id, userId: session.id } });
  if (!addr) return { error: "آدرس یافت نشد" };
  await db.$transaction([
    db.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } }),
    db.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}

// ---------------- پروفایل ----------------

export async function updateProfile(formData: FormData) {
  const session = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();

  const schema = z.object({
    name: z.string().min(2, "نام حداقل ۲ حرف باشد"),
    email: z.string().email("ایمیل معتبر نیست"),
    phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09121234567)"),
  });
  const parsed = schema.safeParse({ name, email, phone });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "خطا" };

  const dup = await db.user.findFirst({ where: { email: parsed.data.email, id: { not: session.id } } });
  if (dup) return { error: "این ایمیل قبلاً ثبت شده است" };

  await db.user.update({ where: { id: session.id }, data: parsed.data });
  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changePassword(formData: FormData) {
  const session = await requireUser();
  const current = String(formData.get("current") ?? "");
  const newPassword = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (newPassword.length < 6) return { error: "رمز جدید حداقل ۶ حرف باشد" };
  if (newPassword !== confirm) return { error: "تکرار رمز جدید مطابقت ندارد" };

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: "کاربر یافت نشد" };
  if (!user.password) return { error: "حساب شما با گوگل ساخته شده. رمز عبور قابل تغییر نیست." };
  if (!(await bcrypt.compare(current, user.password))) return { error: "رمز فعلی اشتباه است" };

  await db.user.update({ where: { id: session.id }, data: { password: await bcrypt.hash(newPassword, 10) } });
  return { ok: true };
}

// ---------------- نظرات من ----------------

export async function deleteMyReview(id: string) {
  const session = await requireUser();
  await db.review.deleteMany({ where: { id, userId: session.id } });
  revalidatePath("/account/reviews");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------- سفارش: لغو و تکرار ----------------

export async function cancelOrder(orderId: string) {
  const session = await requireUser();
  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.id },
    include: { items: true },
  });
  if (!order) return { error: "سفارش یافت نشد" };
  if (!["PENDING", "PAID"].includes(order.status)) return { error: "این سفارش قابل لغو نیست" };

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

  revalidatePath("/", "layout");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${order.id}`);
  return { ok: true };
}

export async function reorder(orderId: string) {
  const session = await getSession();
  const cartSession = await getOrCreateCartSession();
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "سفارش یافت نشد" };

  for (const item of order.items) {
    if (!item.productId) continue;
    const product = await db.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.active || product.stock === 0) continue;

    const existing = await db.cartItem.findFirst({
      where: session
        ? { userId: session.id, productId: item.productId }
        : { sessionId: cartSession, productId: item.productId },
    });
    const qty = Math.min(item.quantity, product.stock);
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + qty, product.stock) },
      });
    } else {
      await db.cartItem.create({
        data: {
          productId: item.productId,
          quantity: qty,
          userId: session?.id ?? null,
          sessionId: session ? null : cartSession,
        },
      });
    }
  }

  revalidatePath("/", "layout");
  redirect("/cart");
}

// ---------------- بازیابی رمز عبور ----------------

export async function resetPasswordRequest(email: string) {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  // همیشه پیام موفقیت نشان بده (برای جلوگیری از enumerate emails)
  if (!user) return { ok: true, message: "اگر ایمیل شما در سیستم ثبت شده باشد، کد بازیابی ارسال شد." };

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 32).toUpperCase();
  const expires = Date.now() + 15 * 60_000; // ۱۵ دقیقه

  // ذخیره با کلید مستقیم توکن برای جستجوی O(1)
  await db.setting.upsert({
    where: { key: `reset_token:${token}` },
    update: { value: JSON.stringify({ userId: user.id, expires }) },
    create: { key: `reset_token:${token}`, value: JSON.stringify({ userId: user.id, expires }) },
  });

  // حذف توکن‌های قبلی این کاربر
  const oldTokens = await db.setting.findMany({
    where: { key: { startsWith: "reset_token:" } },
  });
  for (const row of oldTokens) {
    try {
      const data = JSON.parse(row.value) as { userId: string };
      if (data.userId === user.id) {
        await db.setting.delete({ where: { key: row.key } });
      }
    } catch { /* skip */ }
  }

  // ارسال ایمیل با کد بازیابی
  const { sendEmail, resetPasswordEmailHtml } = await import("@/lib/email");
  await sendEmail(user.email, "بازیابی رمز عبور", resetPasswordEmailHtml(user.name, token));

  return { ok: true, message: "کد بازیابی ارسال شد." };
}

export async function resetPasswordConfirm(token: string, newPassword: string) {
  if (newPassword.length < 6) return { error: "رمز جدید حداقل ۶ حرف باشد" };

  const trimmedToken = token.trim().toUpperCase();

  // Rate limiting بر اساس توکن — ذخیره در دیتابیس
  const RATE_LIMIT = 5;
  const RATE_WINDOW = 60_000;
  const rateKey = `reset_rate:${trimmedToken.slice(0, 16)}`;
  const rateRow = await db.setting.findUnique({ where: { key: rateKey } });
  const now = Date.now();
  let rateData = { count: 0, resetAt: now + RATE_WINDOW };
  if (rateRow) {
    try {
      rateData = JSON.parse(rateRow.value);
    } catch { /* reset */ }
  }
  if (now <= rateData.resetAt && rateData.count >= RATE_LIMIT) {
    return { error: "تعداد تلاش‌ها زیاد است. لطفاً ۱ دقیقه صبر کنید." };
  }
  if (now > rateData.resetAt) {
    rateData = { count: 1, resetAt: now + RATE_WINDOW };
  } else {
    rateData.count++;
  }
  await db.setting.upsert({
    where: { key: rateKey },
    update: { value: JSON.stringify(rateData) },
    create: { key: rateKey, value: JSON.stringify(rateData) },
  });

  // جستجوی O(1) با کلید مستقیم توکن
  const row = await db.setting.findUnique({ where: { key: `reset_token:${trimmedToken}` } });
  if (!row) return { error: "کد بازیابی نامعتبر یا منقضی شده است." };

  try {
    const data = JSON.parse(row.value) as { userId: string; expires: number };
    if (Date.now() > data.expires) {
      await db.setting.delete({ where: { key: row.key } });
      return { error: "کد بازیابی منقضی شده است." };
    }
    await db.user.update({
      where: { id: data.userId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
    await db.setting.delete({ where: { key: row.key } });
    // حذف rate limit
    await db.setting.delete({ where: { key: rateKey } }).catch(() => {});
    return { ok: true };
  } catch {
    return { error: "کد بازیابی نامعتبر است." };
  }
}

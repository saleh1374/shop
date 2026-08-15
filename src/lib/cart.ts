import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const CART_COOKIE = "cart_session";

export async function getOrCreateCartSession(): Promise<string> {
  const store = await cookies();
  let id = store.get(CART_COOKIE)?.value;
  if (!id) {
    id = crypto.randomUUID();
    store.set(CART_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return id;
}

export async function getCartSession(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

type CartWithProduct = {
  id: string;
  quantity: number;
  sessionId: string | null;
  userId: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    stock: number;
    images: { url: string }[];
  };
};

export function cartItemPrice(p: CartWithProduct["product"]) {
  return p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
}

export async function getCart() {
  const session = await getSession();
  const store = await cookies();
  const sessionId = store.get(CART_COOKIE)?.value;

  const items = await db.cartItem.findMany({
    where: { OR: [{ userId: session?.id ?? "" }, { sessionId: sessionId ?? "" }] },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          stock: true,
          images: { select: { url: true }, orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const subtotal = items.reduce(
    (sum, i) => sum + cartItemPrice(i.product) * i.quantity,
    0
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, subtotal, count };
}

export async function cartCount() {
  const cart = await getCart();
  return cart.count;
}

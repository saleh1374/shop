export function cartItemPrice(p: { price: number; salePrice: number | null }) {
  return p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
}

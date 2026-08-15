const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);
}

export function toToman(num: number | null | undefined): string {
  return toFa(Number(num ?? 0).toLocaleString("en-US")) + " تومان";
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const PERSIAN_CHARS_TO_SKIP = /[^آ-یa-z0-9\s-]/g;

export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(PERSIAN_CHARS_TO_SKIP, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "bg-amber-100 text-amber-800" },
  PAID: { label: "پرداخت شده", color: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-800" },
  DELIVERED: { label: "تحویل شده", color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-800" },
};

export function orderStatusLabel(status: string) {
  return ORDER_STATUS[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
}

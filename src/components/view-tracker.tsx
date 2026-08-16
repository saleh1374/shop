"use client";

import { useEffect } from "react";

const VIEW_KEY = "product_views";
const DEDUP_WINDOW = 30 * 60 * 1000;

export default function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIEW_KEY);
      const views: Record<string, number> = raw ? JSON.parse(raw) : {};
      const last = views[productId] ?? 0;
      if (Date.now() - last < DEDUP_WINDOW) return;
      views[productId] = Date.now();
      localStorage.setItem(VIEW_KEY, JSON.stringify(views));
    } catch {
      // localStorage unavailable
    }

    fetch("/api/product/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => {});
  }, [productId]);
  return null;
}

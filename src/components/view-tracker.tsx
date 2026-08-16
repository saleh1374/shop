"use client";

import { useEffect } from "react";

export default function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    fetch("/api/product/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => {});
  }, [productId]);
  return null;
}

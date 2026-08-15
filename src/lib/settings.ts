import { db } from "@/lib/db";

const CACHE_TTL = 60_000;
let cache: { data: Record<string, string>; at: number } | null = null;

export async function getSettings(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < CACHE_TTL) return cache.data;
  const rows = await db.setting.findMany();
  const data: Record<string, string> = {};
  for (const r of rows) data[r.key] = r.value;
  cache = { data, at: Date.now() };
  return data;
}

export async function setSetting(key: string, value: string) {
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  cache = null;
}

export function setting(s: Record<string, string>, key: string, fallback = "") {
  return s[key]?.trim() || fallback;
}

import { mkdir, writeFile, rm } from "node:fs/promises";
import pg from "pg";

const { Client } = pg;
const db = new Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const keywords = {
  "گوشی-موبایل-سامسونگ-گلکسی-a55": "samsung phone",
  "گوشی-موبایل-شیائومی-ردمی-نوت-13": "xiaomi phone",
  "گوشی-موبایل-اپل-آیفون-15": "iphone smartphone",
  "تبلت-سامسونگ-گلکسی-tab-s9": "samsung tablet",
  "لپتاپ-ایسوس-zenbook-14": "asus laptop",
  "لپتاپ-ایسر-aspire-5": "acer laptop",
  "مونیتور-الجی-27-اینچ-4k": "lg monitor",
  "هدفون-بیسیم-سونی-wh-1000xm5": "sony headphones",
  "هدفون-بیسیم-اپل-ایرپادز-پرو-2": "airpods earbuds",
  "هندزفری-شیائومی-ردمی-بادز-5": "earbuds wireless",
  "اسپیکر-بلوتوثی-جیبیال-charge-5": "bluetooth speaker",
  "تلویزیون-سامسونگ-55-اینچ-4k": "samsung television",
  "ماشین-لباسشویی-الجی-9-کیلو": "washing machine",
  "یخچال-ساید-بای-ساید-سامسونگ": "refrigerator kitchen",
  "مایکروویو-پاناسونیک-لیتری": "microwave oven",
  "پیراهن-مردانه-آستین-بلند": "men shirt fashion",
  "مانتو-زنانه-پاییزه": "woman coat fashion",
  "کفش-اسپرت-مردانه": "sneakers shoes",
  "ساعت-هوشمند-اپل-واچ-سری-9": "apple watch",
  "ساعت-هوشمند-امیزفیت-gts-4": "smartwatch",
  "دوربین-عکاسی-کانن-eos-r50": "canon camera",
  "پاوربانک-شیائومی-20000mah": "power bank charger",
  "کیبورد-مکانیکال-ردراگون": "mechanical keyboard",
  "ماوس-گیمینگ-لاجیتک-g502": "gaming mouse",
};

const alt = {
  0: "black",
  1: "white",
  2: "blue",
};

async function download(url, path) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) throw new Error("too small: " + buf.length);
      await writeFile(path, buf);
      return buf.length;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function main() {
  const dir = "public/uploads/products";
  await mkdir(dir, { recursive: true });

  const products = await db.query(
    `SELECT p.slug, json_agg(json_build_object('id', pi.id, 'url', pi.url)) AS images
     FROM "Product" p JOIN "ProductImage" pi ON pi."productId" = p.id
     GROUP BY p.slug`
  );
  const rows = products.rows;
  console.log("products:", rows.length);

  let done = 0;
  const jobs = [];
  for (const r of rows) {
    const p = { slug: r.slug, images: r.images };
    const kw = keywords[p.slug] ?? p.slug.replace(/-/g, " ");
    for (let i = 0; i < 3; i++) {
      const file = `${p.slug}-${i}.jpg`;
      const url = `https://loremflickr.com/800/800/${kw.replace(/ /g, ",")},${alt[i]}?lock=${Math.floor(Math.random() * 1e9)}`;
      jobs.push(
        download(url, `${dir}/${file}`)
          .then((size) => {
            done++;
            console.log(`[${done}/72] ${file} (${Math.round(size / 1024)} KB)`);
          })
          .catch((e) => {
            done++;
            console.log(`[${done}/72] FAIL ${file}: ${e.message}`);
          })
      );
    }
  }

  const batchSize = 6;
  for (let i = 0; i < jobs.length; i += batchSize) {
    await Promise.all(jobs.slice(i, i + batchSize));
  }

  for (const r of rows) {
    for (const img of r.images) {
      await db.query(`UPDATE "ProductImage" SET url = $1 WHERE id = $2`, [
        img.url.replace(/\.svg$/, ".jpg"),
        img.id,
      ]);
    }
  }
  console.log("db urls updated:", rows.length * 3);

  for (const r of rows) {
    for (let i = 0; i < 3; i++) {
      await rm(`${dir}/${r.slug}-${i}.svg`, { force: true });
    }
  }
  console.log("old svg files removed");
  await db.end();
  process.exit(0);
}

main();
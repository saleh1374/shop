import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) pass++; else fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  |  " + extra : ""}`);
};

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  await page.goto(BASE + "/");
  await page.waitForLoadState("networkidle");
  ok("home renders product links", (await page.locator("a[href*='/products/']").count()) > 5);

  await page.goto(BASE + "/products");
  await page.waitForLoadState("networkidle");
  ok("products grid", (await page.locator("a[href*='/products/']").count()) > 0);

  await page.goto(BASE + "/account/login");
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"]', "admin@shop.ir");
  await page.fill('input[name="password"]', "admin123");
  await page.locator('form:has(input[name="email"]) button[type="submit"]').click();
  await page.waitForURL("**/account", { timeout: 20000 });
  ok("admin login -> /account", true);

  await page.goto(BASE + "/admin");
  await page.waitForLoadState("networkidle");
  ok("admin dashboard accessible", page.url().includes("/admin"));
  ok("dashboard has stats", /محصول|سفارش/.test(await page.textContent("body")));

  await page.goto(BASE + "/products");
  await page.waitForLoadState("networkidle");
  await page.locator("a[href*='/products/']").first().click();
  await page.waitForLoadState("networkidle");
  ok("product page opens", page.url().includes("/products/"));
  await page.locator('button:has-text("افزودن به سبد")').first().click();
  await page.waitForTimeout(1500);
  const badge = await page.locator("a[href='/cart'] span.absolute").textContent().catch(() => "");
  ok("cart badge shows 1", (badge || "").includes("1"), "badge=" + badge);

  await page.goto(BASE + "/cart");
  await page.waitForLoadState("networkidle");
  const cartHasItem = await page.locator('button:has-text("ادامه فرآیند خرید")').count();
  ok("cart has item + checkout button", cartHasItem === 1);

  await page.locator('button:has-text("ادامه فرآیند خرید")').click();
  await page.waitForURL("**/checkout", { timeout: 15000 });
  ok("checkout page", true);

  await page.locator('input[name="discountCode"], input[placeholder*="کد تخفیف"]').first().fill("WELCOME10");
  await page.locator('button:has-text("اعمال")').click();
  await page.waitForTimeout(1000);
  const discountText = await page.textContent("body").catch(() => "");
  ok("discount applied", discountText.includes("اعمال شد"), discountText.includes("اعمال شد") ? "" : discountText.slice(0, 200));

  await page.fill('input[name="name"]', "مدیر فروشگاه");
  await page.fill('input[name="phone"]', "09121234567");
  await page.fill('textarea[name="address"]', "تهران، خیابان تست");
  await page.locator('button:has-text("ثبت سفارش و پرداخت")').click();
  await page.waitForURL("**/payment/**", { timeout: 20000 });
  ok("order created -> payment page", page.url().includes("/payment/"));

  await page.locator('button:has-text("پرداخت آزمایشی")').click();
  await page.waitForURL("**/payment/result**", { timeout: 20000 });
  ok("payment done -> result page", page.url().includes("/payment/result"), page.url());
  const resultText = await page.textContent("body");
  ok("payment success message", resultText.includes("موفقیت"), resultText.slice(0, 200).replace(/\n/g, " "));

  await page.goto(BASE + "/admin/orders");
  await page.waitForLoadState("networkidle");
  const adminOrders = await page.textContent("body");
  ok("admin orders shows rows", /سفارش|پرداخت|تحویل/.test(adminOrders));

  await page.goto(BASE + "/account/orders");
  await page.waitForLoadState("networkidle");
  const userOrders = await page.textContent("body");
  ok("user order list", /سفارش|پرداخت/.test(userOrders));

  await page.goto(BASE + "/admin");
  await page.waitForLoadState("networkidle");
  await page.locator('button:has-text("خروج")').click();
  await page.waitForTimeout(1500);
  await page.goto(BASE + "/admin");
  await page.waitForLoadState("networkidle");
  ok("admin blocked after logout", page.url().includes("/login"), page.url());

  ok("no page errors", errors.length === 0, errors.join(" ; ").slice(0, 200));
  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

main();

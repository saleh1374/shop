import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) pass++; else fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  |  " + extra : ""}`);
};

async function login(page, email, password) {
  await page.goto(BASE + "/account/login");
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.locator('form:has(input[name="email"]) button[type="submit"]').click();
  await page.waitForURL("**/account", { timeout: 20000 });
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("dialog", (d) => d.accept().catch(() => {}));

  // ---------------- فروشگاه عمومی ----------------
  await page.goto(BASE + "/");
  await page.waitForLoadState("networkidle");
  ok("home renders product links", (await page.locator("a[href*='/products/']").count()) > 5);

  await page.goto(BASE + "/products");
  await page.waitForLoadState("networkidle");
  ok("products grid", (await page.locator("a[href*='/products/']").count()) > 0);

  // ---------------- ادمین ----------------
  await login(page, "admin@shop.ir", "admin123");
  ok("admin login -> /account", true);

  await page.goto(BASE + "/admin");
  await page.waitForLoadState("networkidle");
  ok("admin dashboard accessible", page.url().includes("/admin"));
  ok("dashboard has stats", /محصول|سفارش|فروش امروز/.test(await page.textContent("body")));

  await page.goto(BASE + "/admin/users");
  await page.waitForLoadState("networkidle");
  const usersBody = await page.textContent("body");
  ok("admin users page", /کاربران|علی رضایی/.test(usersBody));
  ok("users table has roles", /مدیر|کاربر/.test(usersBody));

  await page.goto(BASE + "/admin/reports");
  await page.waitForLoadState("networkidle");
  const reportsBody = await page.textContent("body");
  ok("admin reports page", /گزارش فروش|فروش روزانه|محصولات پرفروش/.test(reportsBody));
  ok("reports monthly chart", reportsBody.includes("فروش ۱۲ ماه اخیر"));
  ok("reports top customers", reportsBody.includes("مشتریان برتر"));

  await page.goto(BASE + "/admin/products");
  await page.waitForLoadState("networkidle");
  ok("admin products has filters", (await page.locator('select[name="category"]').count()) === 1);

  await page.goto(BASE + "/admin/reviews");
  await page.waitForLoadState("networkidle");
  ok("admin reviews tabs", (await page.locator("a[href*='/admin/reviews?status=']").count()) >= 3);

  await page.goto(BASE + "/admin/orders");
  await page.waitForLoadState("networkidle");
  ok("admin orders summary bar", /مجموع سفارش/.test(await page.textContent("body")));

  // اعلان‌های ادمین
  await page.goto(BASE + "/account/notifications");
  await page.waitForLoadState("networkidle");
  const adminNotif = await page.textContent("body");
  ok("admin notifications page", /اعلان‌ها|خوش آمدید/.test(adminNotif));
  ok("header bell shows unread badge", (await page.locator('a[aria-label="اعلان‌ها"]').count()) === 1);

  // ---------------- خرید + سفارش + جزئیات ادمین ----------------
  await page.goto(BASE + "/products");
  await page.waitForLoadState("networkidle");
  await page.locator("a[href*='/products/']").first().click();
  await page.waitForURL("**/products/*", { timeout: 20000 });
  ok("product page opens", page.url().includes("/products/"));
  ok("product rating stars shown", /بدون امتیاز|از ۵/.test(await page.textContent("body")));

  // محصول ناموجود
  await page.goto(BASE + "/products?q=" + encodeURIComponent("پلی‌استیشن"));
  await page.waitForLoadState("networkidle");
  const ps5Link = page.locator("a[href*='/products/']").first();
  if ((await ps5Link.count()) > 0) {
    await ps5Link.click();
    await page.waitForURL("**/products/*", { timeout: 20000 });
    const ps5Body = await page.textContent("body");
    ok("out-of-stock product shows ناموجود", ps5Body.includes("ناموجود"));
  } else {
    ok("out-of-stock product shows ناموجود", false, "PS5 not found");
  }

  // خرید + کوپن در سبد (گوشی سامسونگ A55 — موجود و بالای آستانه ارسال رایگان)
  await page.goto(BASE + "/products?q=" + encodeURIComponent("سامسونگ گلکسی A55"));
  await page.waitForLoadState("networkidle");
  await page.locator("a[href*='/products/']").first().click();
  await page.waitForURL("**/products/*", { timeout: 20000 });
  await page.locator('button:has-text("افزودن به سبد")').first().click();
  await page.waitForTimeout(2000);

  await page.goto(BASE + "/cart");
  await page.waitForLoadState("networkidle");
  ok("cart has coupon input", (await page.locator('input[placeholder="کد تخفیف خود را وارد کنید"]').count()) === 1);
  ok("cart shows shipping line", /هزینه ارسال/.test(await page.textContent("body")));

  await page.fill('input[placeholder="کد تخفیف خود را وارد کنید"]', "WELCOME10");
  await page.locator('button:has-text("اعمال")').click();
  await page.waitForTimeout(2000);
  const cartAfterCoupon = await page.textContent("body");
  ok("coupon applied in cart", cartAfterCoupon.includes("اعمال شد"), cartAfterCoupon.includes("تخفیف") ? "" : "no discount line");
  ok("coupon discount amount shown", cartAfterCoupon.includes("۵۰۰,۰۰۰"));

  await page.locator('a:has-text("ادامه فرآیند خرید")').click();
  await page.waitForURL("**/checkout", { timeout: 15000 });
  ok("checkout page", true);
  ok("checkout shows shipping + discount", /هزینه ارسال|تخفیف/.test(await page.textContent("body")));

  await page.fill('input[name="name"]', "مدیر فروشگاه");
  await page.fill('input[name="phone"]', "09121234567");
  await page.selectOption('select[name="province"]', { label: "تهران" });
  await page.selectOption('select[name="city"]', { label: "تهران" });
  await page.fill('textarea[name="address"]', "خیابان تست، پلاک ۱");
  await page.locator('button:has-text("ثبت سفارش و پرداخت")').click();
  await page.waitForURL("**/payment/**", { timeout: 25000 });
  await page.locator('button:has-text("پرداخت آزمایشی")').click();
  await page.waitForURL("**/payment/result**", { timeout: 25000 });
  ok("payment done -> result page", page.url().includes("/payment/result"));
  ok("payment success message", (await page.textContent("body")).includes("موفقیت"));

  const orderUrl = page.url();
  const orderNum = orderUrl.match(/order=(\d+)/)?.[1] ?? "";

  // جزئیات سفارش ادمین + فاکتور + تغییر وضعیت
  await page.goto(BASE + "/admin/orders");
  await page.waitForLoadState("networkidle");
  await page.locator('a[href*="/admin/orders/"]').first().click();
  await page.waitForURL("**/admin/orders/*", { timeout: 15000 });
  const orderDetail = await page.textContent("body");
  ok("admin order detail timeline", /ثبت سفارش|پرداخت/.test(orderDetail));
  ok("admin order detail print button", (await page.locator('button:has-text("چاپ فاکتور")').count()) === 1);
  ok("admin order invoice link", (await page.locator('a:has-text("فاکتور رسمی")').count()) === 1);

  await page.locator('a:has-text("فاکتور رسمی")').click();
  await page.waitForURL("**/invoice/*", { timeout: 15000 });
  const invoiceBody = await page.textContent("body");
  ok("invoice page renders", invoiceBody.includes("فاکتور رسمی فروش"));
  ok("invoice PDF button", (await page.locator('button:has-text("دانلود PDF فاکتور")').count()) === 1);
  ok("invoice shows totals", /مبلغ نهایی|جمع کالاها/.test(invoiceBody));

  await page.goto(BASE + "/admin/orders");
  await page.waitForLoadState("networkidle");
  await page.locator('a[href*="/admin/orders/"]').first().click();
  await page.waitForURL("**/admin/orders/*", { timeout: 15000 });
  await page.locator("select").selectOption("SHIPPED");
  await page.waitForTimeout(2000);
  ok("admin can change order status", (await page.textContent("body")).includes("ارسال شده"));

  // ---------------- خروج ادمین و ورود کاربر ----------------
  await page.goto(BASE + "/admin");
  await page.waitForLoadState("networkidle");
  await page.locator('button:has-text("خروج")').first().click();
  await page.waitForTimeout(1500);
  await page.goto(BASE + "/admin");
  await page.waitForLoadState("networkidle");
  ok("admin blocked after logout", page.url().includes("/login"), page.url());

  await login(page, "ali@shop.ir", "user123");
  ok("user login -> /account", true);
  const dashBody = await page.textContent("body");
  ok("account dashboard stats", /مجموع خرید|علاقه‌مندی‌ها|سفارش‌های اخیر/.test(dashBody));
  ok("account sidebar wishlist count", /۳|علاقه‌مندی/.test(dashBody));

  // اعلان‌های کاربر
  await page.goto(BASE + "/account/notifications");
  await page.waitForLoadState("networkidle");
  const userNotif = await page.textContent("body");
  ok("user notifications show welcome", userNotif.includes("خوش آمدید"));

  // ---------------- علاقه‌مندی‌ها ----------------
  await page.goto(BASE + "/account/wishlist");
  await page.waitForLoadState("networkidle");
  const beforeCount = await page.locator('button[aria-label="حذف از علاقه‌مندی‌ها"]').count();
  ok("wishlist shows seeded items", beforeCount > 0, "items=" + beforeCount);
  await page.locator('button[aria-label="حذف از علاقه‌مندی‌ها"]').first().click();
  await page.waitForTimeout(1500);
  const afterCount = await page.locator('button[aria-label="حذف از علاقه‌مندی‌ها"]').count();
  ok("wishlist remove works", afterCount === beforeCount - 1, `before=${beforeCount} after=${afterCount}`);

  await page.goto(BASE + "/products");
  await page.waitForLoadState("networkidle");
  await page.locator("a[href*='/products/']").nth(7).click();
  await page.waitForURL("**/products/*", { timeout: 20000 });
  const heartBtn = page.locator('button:has-text("افزودن به علاقه‌مندی‌ها"), button:has-text("در علاقه‌مندی‌ها")');
  const wasIn = (await page.textContent("body")).includes("در علاقه‌مندی‌ها");
  await heartBtn.first().click();
  await page.waitForTimeout(1500);
  const nowIn = (await page.textContent("body")).includes("در علاقه‌مندی‌ها");
  ok("wishlist toggle on product page", nowIn !== wasIn, `was=${wasIn} now=${nowIn}`);

  // ---------------- آدرس‌ها ----------------
  await page.goto(BASE + "/account/addresses");
  await page.waitForLoadState("networkidle");
  const addrBody = await page.textContent("body");
  ok("seeded addresses", /خانه|محل کار|پیش‌فرض/.test(addrBody));

  await page.locator('button:has-text("افزودن آدرس")').click();
  await page.fill('input[name="title"]', "منزل پدری");
  await page.fill('input[name="receiverName"]', "علی رضایی");
  await page.fill('input[name="receiverPhone"]', "09121234567");
  await page.selectOption('select[name="province"]', { label: "اصفهان" });
  await page.selectOption('select[name="city"]', { label: "اصفهان" });
  await page.fill('textarea[name="address"]', "خیابان چهارباغ، کوچه نارنج، پلاک ۷");
  await page.fill('input[name="postalCode"]', "1234567890");
  await page.locator('button:has-text("ذخیره آدرس")').click();
  await page.waitForTimeout(1500);
  ok("address added", (await page.textContent("body")).includes("منزل پدری"));

  // ---------------- نظرات من ----------------
  await page.goto(BASE + "/account/reviews");
  await page.waitForLoadState("networkidle");
  ok("my reviews page", /کیفیت عالی داشت|تأیید شده/.test(await page.textContent("body")));

  // ---------------- سفارش + لغو + فاکتور کاربر ----------------
  await page.goto(BASE + "/products");
  await page.waitForLoadState("networkidle");
  await page.locator("a[href*='/products/']").nth(5).click();
  await page.waitForURL("**/products/*", { timeout: 20000 });
  await page.locator('button:has-text("افزودن به سبد")').first().click();
  await page.waitForTimeout(2000);

  await page.goto(BASE + "/cart");
  await page.waitForLoadState("networkidle");
  await page.locator('a:has-text("ادامه فرآیند خرید")').click();
  await page.waitForURL("**/checkout", { timeout: 15000 });
  await page.locator('button:has-text("پرداخت در محل")').click();
  await page.locator("select").first().selectOption({ index: 1 });
  await page.waitForTimeout(500);
  await page.locator('button:has-text("ثبت سفارش")').click();
  await page.waitForURL("**/payment/result**", { timeout: 25000 });
  ok("COD order -> result", page.url().includes("status=cod"));

  await page.goto(BASE + "/account/notifications");
  await page.waitForLoadState("networkidle");
  ok("user got order notification", (await page.textContent("body")).includes("سفارش شما ثبت شد"));

  await page.goto(BASE + "/account/orders");
  await page.waitForLoadState("networkidle");
  await page.locator('a:has-text("جزئیات")').first().click();
  await page.waitForURL("**/account/orders/*", { timeout: 15000 });
  ok("user order has invoice link", (await page.locator('a:has-text("مشاهده فاکتور رسمی")').count()) === 1);
  ok("user order shows shipping line", /هزینه ارسال/.test(await page.textContent("body")));
  await page.locator('button:has-text("لغو سفارش")').click();
  await page.waitForTimeout(2000);
  ok("order cancelled", (await page.textContent("body")).includes("لغو شده"));

  // ---------------- پروفایل ----------------
  await page.goto(BASE + "/account/profile");
  await page.waitForLoadState("networkidle");
  await page.fill('form:has(input[name="name"]) input[name="phone"]', "09120000000");
  await page.locator('form:has(input[name="name"]) button:has-text("ذخیره تغییرات")').click();
  await page.waitForTimeout(1500);
  ok("profile saved", (await page.textContent("body")).includes("اطلاعات با موفقیت ذخیره شد"));

  await page.fill('input[name="current"]', "user123");
  await page.fill('input[name="next"]', "newpass123");
  await page.fill('input[name="confirm"]', "newpass123");
  await page.locator('button:has-text("تغییر رمز عبور")').click();
  await page.waitForTimeout(1500);
  ok("password changed", (await page.textContent("body")).includes("رمز عبور با موفقیت تغییر کرد"));

  await page.locator('button:has-text("خروج")').first().click();
  await page.waitForTimeout(1500);
  await login(page, "ali@shop.ir", "newpass123");
  ok("login with new password", page.url().includes("/account"));

  ok("no page errors", errors.length === 0, errors.join(" ; ").slice(0, 300));
  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

main();
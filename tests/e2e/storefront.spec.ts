import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { cleanupE2EFixtures, createE2EFixtures, e2ePrisma, type E2EFixtures } from "./database";

let fixtures: E2EFixtures;

test.beforeAll(async () => {
  fixtures = await createE2EFixtures();
});

test.afterAll(async () => {
  if (fixtures) await cleanupE2EFixtures(fixtures);
});

test("guest checkout, WhatsApp, claim, admin confirmation, stock, and invoice", async ({
  browser,
  baseURL,
}) => {
  const guest = await browser.newPage();
  await guest.goto(`/products/${fixtures.slug}`);
  await guest.getByLabel("Quantity").selectOption("3");
  await guest.getByRole("button", { name: "Add to bag" }).click();
  await guest.goto("/checkout");
  await guest.getByLabel("Coupon code (optional)").fill(fixtures.couponCode);
  await guest.getByRole("button", { name: "Apply" }).click();
  await expect(guest.getByText(/Coupon applied/)).toBeVisible();
  await guest.getByLabel("Full name").fill("E2E Guest");
  await guest.getByLabel("Mobile number").fill("9876543210");
  await guest.getByLabel("Address line").fill("4 Test Road");
  await guest.getByLabel("City").fill("Ahmedabad");
  await guest.getByLabel("State").fill("Gujarat");
  await guest.getByLabel("Pincode").fill("380001");
  await guest.getByRole("button", { name: "Place order request" }).click();
  await guest.waitForURL(
    (url) => url.pathname.startsWith("/order/") && url.searchParams.has("token"),
  );

  const orderUrl = new URL(guest.url());
  const orderNumber = orderUrl.pathname.split("/").pop()!;
  const token = orderUrl.searchParams.get("token")!;
  fixtures.orderNumbers.push(orderNumber);
  const whatsappHref = await guest
    .getByRole("link", { name: "Send order on WhatsApp" })
    .getAttribute("href");
  const whatsappUrl = new URL(whatsappHref!);
  const message = whatsappUrl.searchParams.get("text") ?? "";
  expect(whatsappUrl.hostname).toBe("wa.me");
  expect(message).toContain(orderNumber);
  expect(message).toContain(`${baseURL}/products/${fixtures.slug}`);

  let order = await e2ePrisma.order.findUniqueOrThrow({
    where: { orderNumber },
    select: { id: true, discountTotal: true, status: true },
  });
  expect(order.discountTotal).toBe(75000);
  expect(order.status).toBe("PENDING");
  await expect(
    e2ePrisma.productVariant.findUniqueOrThrow({ where: { id: fixtures.variantId } }),
  ).resolves.toMatchObject({ stock: fixtures.initialStock });

  const customerContext = await browser.newContext();
  const customer = await customerContext.newPage();
  await signIn(customer, fixtures.customerEmail, fixtures.password);
  await customer.goto(`${orderUrl.pathname}?token=${encodeURIComponent(token)}`);
  await customer.getByRole("button", { name: "Add this order to my account" }).click();
  await expect(
    customer.getByText("This order is now in your account order history."),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (
          await e2ePrisma.order.findUniqueOrThrow({
            where: { orderNumber },
            select: { userId: true },
          })
        ).userId,
    )
    .not.toBeNull();
  await customerContext.close();

  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await signIn(admin, fixtures.adminEmail, fixtures.password);
  order = await e2ePrisma.order.findUniqueOrThrow({
    where: { orderNumber },
    select: { id: true, discountTotal: true, status: true },
  });
  await admin.goto(`/admin/orders/${order.id}`);
  await admin.getByLabel("Next order status").selectOption("CONFIRMED");
  await admin.getByRole("button", { name: "Update status" }).click();
  await expect
    .poll(
      async () =>
        (
          await e2ePrisma.order.findUniqueOrThrow({
            where: { orderNumber },
            select: { status: true },
          })
        ).status,
    )
    .toBe("CONFIRMED");
  await expect
    .poll(
      async () =>
        (
          await e2ePrisma.productVariant.findUniqueOrThrow({
            where: { id: fixtures.variantId },
            select: { stock: true },
          })
        ).stock,
    )
    .toBe(fixtures.initialStock - 3);

  const downloadPromise = admin.waitForEvent("download");
  await admin.getByRole("link", { name: "Download invoice" }).click();
  const invoice = await downloadPromise;
  expect(invoice.suggestedFilename()).toMatch(/^INV-\d{4}-\d+\.pdf$/);
  await adminContext.close();
  await guest.close();
});

test("customers cannot read another customer's order or invoice or enter admin", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, fixtures.customerEmail, fixtures.password);

  const orderResponse = await page.goto(`/account/orders/${fixtures.orderNumbers[0]}`);
  expect(orderResponse?.status()).toBe(404);
  const invoiceResponse = await context.request.get(
    new URL(`/api/orders/${fixtures.orderNumbers[0]}/invoice`, page.url()).toString(),
  );
  expect(invoiceResponse.status()).toBe(404);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/unauthorized$/);
  await context.close();
});

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account(?:\/|$)/);
}

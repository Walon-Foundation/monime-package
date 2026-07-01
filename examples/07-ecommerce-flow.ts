/**
 * End-to-end flow that ties several resources together:
 *
 *   1. Create a business financial account.
 *   2. Create a checkout session for a customer.
 *   3. Generate a USSD payment code as an alternative payment method.
 *   4. Pay a supplier via a mobile money payout.
 *
 * This is illustrative — in production you would react to webhook events
 * (see 06-webhooks.ts) rather than assuming each step immediately settles.
 */
import { client } from "./client";

async function main() {
  // 1. Business account.
  const accountResult = await client.financialAccount.create({
    accountName: "E-commerce Store",
    currency: "SLE",
  });
  if (!accountResult.success) {
    throw new Error(`Failed to create account: ${accountResult.error?.message}`);
  }
  const accountId = accountResult.data!.id;
  console.log("1. Account created:", accountId);

  // 2. Hosted checkout page for the customer.
  const checkout = await client.checkoutSession.create({
    name: "Digital Camera",
    amount: 45000, // 450.00 SLE
    quantity: 1,
    successUrl: "https://store.com/success",
    cancelUrl: "https://store.com/cancel",
    description: "Professional DSLR Camera with lens kit",
    financialAccountId: accountId,
    primaryColor: "#2563EB",
  });
  if (checkout.success) {
    console.log("2. Checkout URL:", checkout.data!.redirectUrl);
  }

  // 3. USSD payment code as an alternative for customers without cards.
  const paymentCode = await client.paymentCode.create({
    paymentName: "Invoice #INV-2024-001",
    amount: 450, // 450.00 SLE (major units for payment codes)
    financialAccountId: accountId,
    name: "Customer Name",
    phoneNumber: "0771234567",
  });
  if (paymentCode.success) {
    console.log("3. USSD code:", paymentCode.data!.ussdCode);
  }

  // 4. Pay a supplier once you've been paid.
  const payout = await client.payout.create({
    amount: 8000, // 80.00 SLE
    sourceAccount: accountId,
    destination: { type: "momo", providerId: "m17", phoneNumber: "0779876543" },
  });
  if (payout.success) {
    console.log("4. Supplier payout:", payout.data!.id, payout.data!.status);
  }
}

main().catch((err) => {
  console.error("Flow failed:", err);
  process.exitCode = 1;
});

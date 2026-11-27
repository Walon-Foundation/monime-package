/**
 * Checkout sessions: create a hosted payment page and get its redirect URL.
 *
 * Prices are in minor units of the currency (cents). `2500` = 25.00 SLE.
 */
import { client } from "./client";

async function main() {
  const checkout = await client.checkoutSession.create({
    name: "Premium Subscription",
    description: "Monthly premium subscription",
    successUrl: "https://myapp.com/success",
    cancelUrl: "https://myapp.com/cancel",
    reference: "sub-2026-11-0001",
    lineItems: [
      {
        name: "Premium (1 month)",
        price: { currency: "SLE", value: 2500 }, // 25.00 SLE per item
        quantity: 1,
        images: ["https://myapp.com/images/premium.jpg"],
      },
    ],
    brandingOptions: { primaryColor: "#3B82F6" },
  });

  if (!checkout.success) {
    console.error("Could not create checkout:", checkout.error?.message);
    return;
  }

  const session = checkout.data!;
  console.log("Checkout ID:  ", session.id);
  console.log("Order number: ", session.orderNumber);
  console.log("Redirect the customer here:", session.redirectUrl);

  // List existing checkout sessions.
  const all = await client.checkoutSession.list();
  if (all.success) {
    console.log(`Total checkout sessions: ${all.data!.length}`);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});

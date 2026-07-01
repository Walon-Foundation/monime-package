/**
 * Checkout sessions: create a hosted payment page and get its redirect URL.
 *
 * Amounts are in minor units of the currency (cents). `2500` = 25.00 SLE.
 */
import { client } from "./client";

async function main() {
  const checkout = await client.checkoutSession.create({
    name: "Premium Subscription",
    amount: 2500, // 25.00 SLE per item
    quantity: 1,
    successUrl: "https://myapp.com/success",
    cancelUrl: "https://myapp.com/cancel",
    description: "Monthly premium subscription",
    primaryColor: "#3B82F6",
    images: ["https://myapp.com/images/premium.jpg"],
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
    console.log(`Total checkout sessions: ${all.data!.result.length}`);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});

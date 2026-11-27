/**
 * Payment codes: generate a USSD code a customer can dial to pay you.
 *
 * Amounts are in minor units, like every other Monime amount:
 * `{ value: 5000 }` charges 50.00 SLE.
 */
import { client } from "./client";

async function main() {
  // A financial account ID (fac-…) from your space. Leave it out to use the
  // space's main account.
  const financialAccountId = process.env.MONIME_FINANCIAL_ACCOUNT_ID;

  const created = await client.paymentCode.create({
    name: "Order #12345",
    amount: { currency: "SLE", value: 5000 }, // 50.00 SLE
    duration: "30m",
    customer: { name: "John Doe" },
    authorizedPhoneNumber: "+23277123456",
    reference: "order-12345",
    ...(financialAccountId ? { financialAccountId } : {}),
  });

  if (!created.success) {
    console.error("Could not create payment code:", created.error?.message);
    return;
  }

  const code = created.data!;
  console.log("USSD code:  ", code.ussdCode);
  console.log("Expires at: ", code.expireTime);
  console.log("Status:     ", code.status);

  // Poll the status once (in a real app you'd rely on webhooks instead).
  const status = await client.paymentCode.retrieve(code.id);
  if (status.success) {
    console.log("Current status:", status.data!.status);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});

/**
 * Payment codes: generate a USSD code a customer can dial to pay you.
 *
 * Note: for payment codes the `amount` is given in major units (SLE) — the SDK
 * converts it to minor units for you. Pass `100` to charge 100.00 SLE.
 */
import { client } from "./client";

async function main() {
  // Replace with a real financial account ID from your space, or pass `null`
  // to use the space's default account.
  const financialAccountId = process.env.MONIME_FINANCIAL_ACCOUNT_ID ?? null;

  const created = await client.paymentCode.create({
    paymentName: "Order #12345",
    amount: 50, // 50.00 SLE
    financialAccountId,
    name: "John Doe",
    phoneNumber: "0771234567",
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

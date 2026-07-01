/**
 * Payouts: send money out to mobile money, a bank, or a wallet.
 *
 * The `destination` is a discriminated union — TypeScript will guide you to the
 * right fields based on the `type` you pick.
 */
import { client } from "./client";
import type { DestinationOption } from "monime-package";

async function main() {
  const sourceAccount = process.env.MONIME_FINANCIAL_ACCOUNT_ID;
  if (!sourceAccount) {
    console.error("Set MONIME_FINANCIAL_ACCOUNT_ID to run this example.");
    return;
  }

  // Mobile money payout (m17 = MTN, m18 = Orange Money).
  const momoDestination: DestinationOption = {
    type: "momo",
    providerId: "m17",
    phoneNumber: "0771234567",
  };

  const payout = await client.payout.create({
    amount: 10000, // 100.00 SLE (minor units)
    sourceAccount,
    destination: momoDestination,
  });

  if (!payout.success) {
    console.error("Payout failed:", payout.error?.message);
    return;
  }

  console.log("Payout ID:", payout.data!.id);
  console.log("Status:   ", payout.data!.status);
  for (const fee of payout.data!.fees) {
    console.log(`Fee ${fee.code}: ${fee.amount.value} ${fee.amount.currency}`);
  }

  // A bank payout would look like this:
  // destination: { type: "bank", providerId: "b01", accountNumber: "1234567890" }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});

/**
 * Internal transfers: move funds between two of your own financial accounts.
 * Amounts are in minor units (cents).
 */
import { client } from "./client";

async function main() {
  const sourceAccount = process.env.MONIME_SOURCE_ACCOUNT_ID;
  const destinationAccount = process.env.MONIME_DEST_ACCOUNT_ID;

  if (!sourceAccount || !destinationAccount) {
    console.error(
      "Set MONIME_SOURCE_ACCOUNT_ID and MONIME_DEST_ACCOUNT_ID to run this example.",
    );
    return;
  }

  const transfer = await client.internalTransfer.create({
    sourceAccount,
    destinationAccount,
    amount: 100000, // 1000.00 SLE
    description: "Move funds to reserve account",
  });

  if (!transfer.success) {
    console.error("Transfer failed:", transfer.error?.message);
    return;
  }

  console.log("Transfer ID:", transfer.data!.id);
  console.log("Status:     ", transfer.data!.status);

  // List all transfers.
  const all = await client.internalTransfer.list();
  if (all.success) {
    console.log(`Total transfers: ${all.data!.result.length}`);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});

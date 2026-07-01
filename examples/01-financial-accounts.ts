/**
 * Financial accounts: create a wallet, retrieve it, and list all accounts.
 *
 * Every SDK call returns `{ success, data?, error? }` — always check `success`
 * before touching `data`.
 */
import { client } from "./client";

async function main() {
  // 1. Create a new financial account (wallet).
  const created = await client.financialAccount.create({
    accountName: "Main Wallet",
    currency: "SLE",
    description: "Primary account for incoming payments",
  });

  if (!created.success) {
    console.error("Could not create account:", created.error?.message);
    return;
  }

  const account = created.data!;
  console.log("Created account:", account.id);
  console.log("Available balance:", account.balance.available.value, account.currency);

  // 2. Retrieve it again by ID.
  const fetched = await client.financialAccount.retrieve(account.id);
  if (fetched.success) {
    console.log("Fetched account name:", fetched.data!.name);
  }

  // 3. List every account in the space.
  const all = await client.financialAccount.list();
  if (all.success) {
    console.log(`You have ${all.data!.result.length} account(s).`);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exitCode = 1;
});

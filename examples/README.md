# Examples

Runnable examples for `monime-package`.

> ⚠️ **Unofficial SDK.** This package is not affiliated with or endorsed by Monime Ltd. See the [main README](../README.md#️-disclaimer) for the full disclaimer.

## Setup

1. Install the package (from the repo root, or `npm install monime-package` in your own project):

   ```bash
   pnpm install
   ```

2. Copy the env template and add your credentials from the [Monime Dashboard](https://monime.io):

   ```bash
   cp examples/.env.example examples/.env
   ```

   Some examples also read optional IDs such as `MONIME_FINANCIAL_ACCOUNT_ID`,
   `MONIME_SOURCE_ACCOUNT_ID`, and `MONIME_DEST_ACCOUNT_ID`.

## Running an example

The examples are plain TypeScript. Any of these work:

```bash
# Node 22.6+ (built-in TypeScript + .env support)
node --env-file=examples/.env --experimental-strip-types examples/01-financial-accounts.ts

# or with tsx
npx tsx --env-file=examples/.env examples/01-financial-accounts.ts

# or with ts-node
node --env-file=examples/.env --loader ts-node/esm examples/01-financial-accounts.ts
```

> 💡 Prefer a **test/sandbox** access token while exploring — several examples
> create real accounts, payouts, and transfers.

## Index

| File | What it shows |
| --- | --- |
| [`client.ts`](./client.ts) | Shared client setup used by every example |
| [`01-financial-accounts.ts`](./01-financial-accounts.ts) | Create, retrieve, and list financial accounts |
| [`02-checkout-session.ts`](./02-checkout-session.ts) | Create a hosted checkout page and get its URL |
| [`03-payment-code.ts`](./03-payment-code.ts) | Generate a USSD payment code and check its status |
| [`04-payout.ts`](./04-payout.ts) | Send a mobile money payout (with typed destinations) |
| [`05-internal-transfer.ts`](./05-internal-transfer.ts) | Move funds between two of your accounts |
| [`06-webhooks.ts`](./06-webhooks.ts) | Register, update, list, and delete webhooks |
| [`07-ecommerce-flow.ts`](./07-ecommerce-flow.ts) | End-to-end flow tying several resources together |

## Notes on amounts

Monime works in a currency's **minor units** (cents). Most methods take the raw
minor-unit value (`45000` = 450.00 SLE). The **payment code** helper is the
exception — it accepts a major-unit amount (`450` = 450.00 SLE) and converts it
for you. Each example calls this out inline.

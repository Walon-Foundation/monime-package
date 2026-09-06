
# monime-package

Unofficial TypeScript SDK for Monime - a modern, type-safe client library for Sierra Leone's leading payment platform. Provides comprehensive API coverage with predictable response patterns and excellent developer experience.

> ### ⚠️ Disclaimer
>
> This is an **unofficial**, community-maintained SDK. It is **not affiliated with, endorsed by, or supported by Monime Ltd.** "Monime" and any related marks are the property of their respective owners and are used here only to describe the API this library talks to.
>
> The software is provided "as is", without warranty of any kind (see [License](#license)). Use it at your own risk. For official tooling and support, refer to Monime's own documentation at [monime.io](https://monime.io).

![npm version](https://img.shields.io/npm/v/monime-package.svg)
![npm downloads](https://img.shields.io/npm/dm/monime-package.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-%3E=18-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)
![Package Size](https://img.shields.io/bundlephobia/minzip/monime-package.svg)

Package: `monime-package`

---

## Table of Contents

- **[Disclaimer](#️-disclaimer)**
- **[Features](#features)**
- **[Installation](#installation)**
- **[Environment Variables](#environment-variables)**
- **[Quick Start](#quick-start)**
- **[API Reference](#api-reference)**
  - **[Payments](#payments)**
  - **[Webhooks](#webhooks)**
  - **[Receipts](#receipts)**
  - **[USSD OTPs](#ussd-otps)**
  - **[Provider KYC](#provider-kyc)**
  - **[Financial Providers (Banks & MoMo)](#financial-providers-banks--momo)**
  - **[Financial Accounts](#financial-accounts)**
  - **[Internal Transfers](#internal-transfers)**
  - **[Payment Codes](#payment-codes)**
  - **[Payouts](#payouts)**
  - **[Financial Transactions](#financial-transactions)**
  - **[Checkout Sessions](#checkout-sessions)**
- **[Configuration](#configuration)**
- **[Complete Examples](#complete-examples)**
- **[TypeScript Types](#typescript-types)**
- **[Idempotency](#idempotency)**
- **[Pagination](#pagination)**
- **[Migration from Old Helpers](#migration-from-old-helpers)**
- **[Error Handling](#error-handling)**
- **[Security](#security)**
- **[Contributing](#contributing)**
- **[Support](#support)**
- **[License](#license)**

---

## Features

- **Typed** request/response objects for safer integrations
- **Predictable** return shape: `{ success, data?, error?, pagination? }`
- **Client-based** auth: set credentials once per instance
- **Minimal dependencies** — native `fetch` for HTTP; [`zod`](https://zod.dev) for runtime input validation
- **Full API coverage** for all Monime endpoints
- **Tree-shaking support** - only bundle what you use
- **Dual module output** - works with both CommonJS and ES modules
- **Mobile Money support** (Africell, Orange, etc.)
- **Bank transfers** and digital wallet integrations
- **Checkout sessions** for hosted payment pages
- **Cursor pagination** on every list endpoint
- **Typed errors** — rate limits, idempotency conflicts and auth failures each get their own class

---

## Installation

```bash
npm install monime-package
# or
pnpm add monime-package
# or
yarn add monime-package
```

**Requirements:**
- Node.js >= 18 — the SDK uses the global `fetch` and `node:crypto`
- TypeScript >= 4.5 (for type safety)
- Modern bundler that supports ES modules and tree-shaking

---

## Environment Variables

Recommended to store credentials in `.env`:

```bash
MONIME_SPACE_ID=spc-XXXXXXXX
MONIME_ACCESS_TOKEN=mon_XXXXXXXX
MONIME_VERSION=caph.2025-08-23 # Optional, defaults to latest
```

The `MonimeClient` will automatically look for these variables if no options are passed to the constructor.

Space IDs are prefixed `spc-`. The **token decides the environment** — there is
one base URL for both. Live tokens start with `mon_`; test tokens start with
`mon_test_` and run against sandbox accounts and simulated payment rails.

---

## Quick Start

### Create a client

You can initialize the client by passing credentials directly:

```ts
import { createClient } from "monime-package";

const client = createClient({
  monimeSpaceId: "your_space_id",
  accessToken: "your_access_token",
  monimeVersion: "caph.2025-08-23", // Optional
});
```

#### Using with Environment Variables (Recommended)

If you have a `.env` file, you can initialize the client even more simply:

```ts
import "dotenv/config";
import { createClient } from "monime-package";

// Client will automatically use MONIME_SPACE_ID and MONIME_ACCESS_TOKEN from process.env
const client = createClient({});
```

Now all methods use the client’s credentials automatically.

### Import styles

```ts
// ESM / TypeScript
import { createClient, type DestinationOption } from "monime-package";

// CommonJS
// const { createClient } = require("monime-package");
```

---

## API Reference

All methods return the same envelope:

```ts
type Result<T> = {
  success: boolean;
  data?: T;
  error?: Error | MonimeError;
  pagination?: Pagination; // list endpoints only
};
```

Every `list()` takes optional [pagination](#pagination) (`{ limit?, after? }`),
and every create/update takes an optional trailing
[`MutationOptions`](#idempotency) so you can supply your own idempotency key.

The client exposes namespaced APIs under `client.<module>`. Below is the complete API reference:

### Payments (New)

Manage all incoming payments (payins).

```ts
// Retrieve payment details
client.payment.retrieve(paymentId: string): Promise<Result<RetrievePaymentResponse>>

// List payments
client.payment.list(options?: ListOptions): Promise<Result<ListPaymentsResponse>>

// Update payment
client.payment.update(paymentId: string, body: any, requestOptions?: MutationOptions): Promise<Result<UpdatePaymentResponse>>
```

### Webhooks (New)

Manage webhooks for real-time notifications.

```ts
// Create webhook
client.webhook.create(body: CreateWebhookRequest, requestOptions?: MutationOptions): Promise<Result<CreateWebhookResponse>>

// Retrieve webhook
client.webhook.retrieve(webhookId: string): Promise<Result<GetWebhookResponse>>

// List webhooks
client.webhook.list(options?: ListOptions): Promise<Result<ListWebhooksResponse>>

// Update webhook
client.webhook.update(webhookId: string, body: UpdateWebhookRequest, requestOptions?: MutationOptions): Promise<Result<UpdateWebhookResponse>>

// Delete webhook
client.webhook.delete(webhookId: string): Promise<Result<void>>
```

### Receipts (New)

Manage payment receipts.

```ts
// Retrieve receipt
client.receipt.retrieve(orderNumber: string): Promise<Result<GetReceiptResponse>>

// Redeem receipt
client.receipt.redeem(orderNumber: string, body: any, requestOptions?: MutationOptions): Promise<Result<RedeemReceiptResponse>>
```

### USSD OTPs (New)

Generate and manage USSD OTP sessions.

```ts
// Create USSD OTP
client.ussdOtp.create(body: CreateUssdOtpRequest, requestOptions?: MutationOptions): Promise<Result<CreateUssdOtpResponse>>

// Retrieve a USSD OTP session by ID
client.ussdOtp.retrieve(ussdOtpId: string): Promise<Result<RetrieveUssdOtpResponse>>

// List a page of USSD OTP sessions
client.ussdOtp.list(options?: ListOptions): Promise<Result<ListUssdOtpsResponse>>

// Delete a USSD OTP session
client.ussdOtp.delete(ussdOtpId: string): Promise<Result<void>>
```

### Provider KYC (New)

Get provider KYC details.

```ts
// Retrieve provider KYC
client.providerKyc.retrieve(providerId: string): Promise<Result<GetProviderKycResponse>>
```

### Financial Providers (Banks & MoMo)

Look up the banks and mobile money providers supported in your space. These are
exposed under `client.financialProvider`.

```ts
// Banks
client.financialProvider.bank.retrieve(providerId: string): Promise<Result<RetrieveBankResponse>>
client.financialProvider.bank.list(options?: ListOptions): Promise<Result<ListBanksResponse>>

// Mobile money providers
client.financialProvider.momo.retrieve(providerId: string): Promise<Result<RetrieveMomoResponse>>
client.financialProvider.momo.list(options?: ListOptions): Promise<Result<ListMomosResponse>>
```

**Example:**
```ts
// List every supported mobile money provider
const providers = await client.financialProvider.momo.list();
if (providers.success) {
  providers.data!.result.forEach((p) => console.log(p.providerId, p.name));
}
```

### Financial Accounts

Manage digital wallets and financial accounts.

```ts
// Create a new financial account
client.financialAccount.create({
  accountName: string,
  currency: "USD" | "SLE",
  description?: string,
  metadata?: Record<string, any>
}, requestOptions?: MutationOptions): Promise<Result<CreateFinancialAccountResponse>>

// Retrieve account details by ID
client.financialAccount.retrieve(financialAccountId: string): Promise<Result<RetrieveFinancialAccountResponse>>

// List a page of financial accounts
client.financialAccount.list(options?: ListOptions): Promise<Result<ListFinancialAccountsResponse>>

// Update an existing financial account (partial)
client.financialAccount.update(financialAccountId: string, body: Record<string, unknown>, requestOptions?: MutationOptions): Promise<Result<UpdateFinancialAccountResponse>>
```

**Parameters:**
- `name`: Account name (required)
- `financialAccountId`: Unique account identifier (required)

**Example:**
```ts
// Create account
const account = await client.financialAccount.create({
  accountName: "My Wallet",
  currency: "SLE"
});
if (account.success) {
  console.log("Account ID:", account.data.id);
}

// Retrieve account details
const details = await client.financialAccount.retrieve("fa-123456");
```

### Internal Transfers

Transfer funds between your financial accounts.

```ts
// Create internal transfer
client.internalTransfer.create({
  sourceAccount: string,
  destinationAccount: string,
  amount: number,
  description?: string
}, requestOptions?: MutationOptions): Promise<Result<CreateInternalTransferResponse>>

// Retrieve transfer details
client.internalTransfer.retrieve(internalTransferId: string): Promise<Result<RetrieveInternalTransferResponse>>

// List a page of transfers
client.internalTransfer.list(options?: ListOptions): Promise<Result<ListInternalTransfersResponse>>

// Update a transfer (description/metadata, pending only)
client.internalTransfer.update(internalTransferId: string, body: Record<string, unknown>, requestOptions?: MutationOptions): Promise<Result<UpdateInternalTransferResponse>>

// Cancel/delete a transfer
client.internalTransfer.delete(internalTransferId: string): Promise<Result<void>>
```

**Parameters:**
- `sourceAccount`: Source financial account ID (required)
- `destinationAccount`: Destination financial account ID (required)
- `amount`: Transfer amount in SLE (required, must be > 0)
- `internalTransferId`: Transfer ID for get/delete operations (required)

**Example:**
```ts
// Transfer 1000 SLE between accounts
const transfer = await client.internalTransfer.create({
  sourceAccount: "fa-source",
  destinationAccount: "fa-dest",
  amount: 1000
});
if (transfer.success) {
  console.log("Transfer ID:", transfer.data.id);
  console.log("Status:", transfer.data.status);
}
```

### Payment Codes

Generate USSD payment codes for mobile money transactions.

```ts
// Create payment code
client.paymentCode.create({
  paymentName: string,
  amount: number,
  financialAccountId: string,
  name: string,
  phoneNumber: string,
}, requestOptions?: MutationOptions): Promise<Result<CreatePaymentCodeResponse>>

// Retrieve payment code details
client.paymentCode.retrieve(paymentCodeId: string): Promise<Result<RetrievePaymentCodeResponse>>

// List a page of payment codes
client.paymentCode.list(options?: ListOptions): Promise<Result<ListPaymentCodesResponse>>

// Update a payment code (partial)
client.paymentCode.update(paymentCodeId: string, body: Record<string, unknown>, requestOptions?: MutationOptions): Promise<Result<UpdatePaymentCodeResponse>>

// Delete payment code
client.paymentCode.delete(paymentCodeId: string): Promise<Result<void>>
```

**Parameters:**
- `paymentName`: Description for the payment (required)
- `amount`: Payment amount in SLE (required, must be > 0)
- `financialAccount`: Target financial account ID (required)
- `username`: Customer name (required)
- `phoneNumber`: Authorized phone number (required)
- `paymentCodeId`: Payment code ID for get/delete operations (required)

**Example:**
```ts
// Create USSD payment code
const paymentCode = await client.paymentCode.create({
  paymentName: "Order #12345",
  amount: 5000, // 50.00 SLE
  financialAccountId: "fa-123456",
  name: "John Doe",
  phoneNumber: "0771234567"
});

if (paymentCode.success) {
  console.log("USSD Code:", paymentCode.data.ussdCode);
  console.log("Expires at:", paymentCode.data.expireTime);
}
```

### Payouts

Send money to mobile money providers, banks, or wallets.

```ts
// Create payout
client.payout.create({
  amount: number,
  destination: DestinationOption,
  sourceAccount: string,
}, requestOptions?: MutationOptions): Promise<Result<CreatePayoutResponse>>

// List a page of payouts
client.payout.list(options?: ListOptions): Promise<Result<ListPayoutsResponse>>

// Retrieve specific payout
client.payout.retrieve(payoutId: string): Promise<Result<RetrievePayoutResponse>>

// Update a payout (pre-processing only)
client.payout.update(payoutId: string, body: Record<string, unknown>, requestOptions?: MutationOptions): Promise<Result<UpdatePayoutResponse>>

// Cancel payout
client.payout.delete(payoutId: string): Promise<Result<void>>
```

**Destination Types:**
```ts
type DestinationOption = 
  | { type: "momo"; providerId: "m17" | "m18"; phoneNumber: string }
  | { type: "bank"; providerId: "b01" | "b02" | "b03"; accountNumber: string }
  | { type: "wallet"; providerId: "w01" | "w02"; walletId: string };
```

**Parameters:**
- `amount`: Payout amount in SLE (required, must be > 0)
- `destination`: Payout destination (required)
- `sourceAccount`: Source financial account ID (required)
- `payoutId`: Payout ID for get/delete operations (required)

**Example:**
```ts
// Mobile money payout
const mobileMoneyPayout = await client.payout.create({
  amount: 10000, // 100.00 SLE
  destination: { type: "momo", providerId: "m17", phoneNumber: "0771234567" },
  sourceAccount: "fa-123456"
});

// Bank transfer payout
const bankPayout = await client.payout.create({
  amount: 50000, // 500.00 SLE
  destination: { type: "bank", providerId: "b01", accountNumber: "1234567890" },
  sourceAccount: "fa-123456"
});
```

### Financial Transactions

Query transaction history and details.

```ts
// Retrieve transaction details
client.financialTransaction.retrieve(transactionId: string): Promise<Result<RetrieveTransactionResponse>>

// List a page of transactions
client.financialTransaction.list(options?: ListOptions): Promise<Result<ListTransactionsResponse>>
```

**Parameters:**
- `transactionId`: Transaction ID (required)

**Example:**
```ts
// One page of transactions (defaults to 10; ask for more with `limit`)
const transactions = await client.financialTransaction.list({ limit: 50 });
if (transactions.success) {
  transactions.data.forEach(tx => {
    console.log(`${tx.type}: ${tx.amount.value} ${tx.amount.currency}`);
  });

  // Keep going while the API hands back a cursor.
  console.log("More pages?", transactions.pagination?.next != null);
}
```

### Checkout Sessions

Create hosted payment pages for seamless customer payments.

```ts
// Create checkout session
client.checkoutSession.create({
  name: string,
  amount: number,
  quantity: number,
  successUrl: string,
  cancelUrl: string,
  description?: string,
  financialAccountId?: string,
  primaryColor?: string,
  images?: string[],
}, requestOptions?: MutationOptions): Promise<Result<CreateCheckoutResponse>>

// List a page of checkout sessions
client.checkoutSession.list(options?: ListOptions): Promise<Result<ListCheckoutsResponse>>

// Retrieve specific checkout session
client.checkoutSession.retrieve(checkoutId: string): Promise<Result<RetrieveCheckoutResponse>>

// Delete checkout session
client.checkoutSession.delete(checkoutId: string): Promise<Result<void>>
```

**Parameters:**
- `name`: Product/service name (required)
- `amount`: Price per item in SLE (required)
- `quantity`: Number of items (required)
- `successUrl`: Redirect URL after successful payment (required)
- `cancelUrl`: Redirect URL when payment is cancelled (required)
- `description`: Product description (optional)
- `financialAccountId`: Target account for payments (optional)
- `primaryColor`: Brand color in hex format (optional)
- `images`: Product image URLs (optional)
- `checkoutId`: Checkout session ID for get/delete operations (required)

**Example:**
```ts
// Create checkout for e-commerce
const checkout = await client.checkoutSession.create({
  name: "Premium Subscription",
  amount: 2500, // 25.00 SLE per month
  quantity: 1,
  successUrl: "https://myapp.com/success",
  cancelUrl: "https://myapp.com/cancel",
  description: "Monthly premium subscription",
  financialAccountId: "fa-123456",
  primaryColor: "#3B82F6", // Blue color
  images: ["https://myapp.com/images/premium.jpg"]
});

if (checkout.success) {
  // Redirect customer to checkout page
  console.log("Checkout URL:", checkout.data.redirectUrl);
  console.log("Order Number:", checkout.data.orderNumber);
}
```

---

## Configuration

The client accepts the following options (see `src/client.ts`):

```ts
type ClientOptions = {
  monimeSpaceId?: string; // Your Monime Space ID; falls back to MONIME_SPACE_ID
  accessToken?: string;   // Your Monime API token; falls back to MONIME_ACCESS_TOKEN
  monimeVersion?: "caph.2025-08-23" | "caph.2025-06-20"; // falls back to MONIME_VERSION
};
```

- **Authentication**: Space ID and token are both required — pass them here or set the environment variables. The constructor throws if either is missing.
- **Headers**: SDK automatically sets `Authorization`, `Monime-Space-Id`, `Monime-Version` (when configured) and `Idempotency-Key` (on create/update) for each call.

---

## Development & Build

This package uses modern tooling for development and building:

### Build System
- **tsup** for fast TypeScript compilation with dual CJS/ESM output
- **Biome** for code formatting and linting
- **Vitest** for testing framework

### Available Scripts
```bash
# Build the package
pnpm build

# Run tests
pnpm test

# Format and lint code
pnpm lint-format
```

### Project Structure

```
monime-package/
├── src/
│   ├── index.ts            # Public entry point — exports createClient, types, errors
│   ├── client.ts           # MonimeClient — wires every resource to your credentials
│   ├── http.ts             # Shared native `fetch` logic, headers, and error plumbing
│   ├── error.ts            # MonimeError and its subclasses (auth, conflict, rate limit)
│   ├── resources/          # One file per API resource (payment.ts, payout.ts, …)
│   ├── types/              # TypeScript request/response interfaces per resource
│   └── validators/         # Zod schemas used to validate inputs before a request
├── test/
│   ├── e2e/                # End-to-end tests per resource
│   └── unit/validators/    # Unit tests for the Zod validators
├── examples/               # Runnable usage examples (see examples/README.md)
├── biome.json              # Biome linter/formatter config
├── tsup.config.ts          # Build config (dual CJS/ESM output)
└── tsconfig.json           # TypeScript compiler config
```

Each API resource is implemented as a trio: a class in `src/resources/`, its
request/response types in `src/types/`, and (for endpoints that accept input) a
Zod validator in `src/validators/`. When adding a resource, follow that pattern.

---

## Complete Examples

> 📁 **Runnable versions** of everything below live in the [`examples/`](./examples) directory. See [`examples/README.md`](./examples/README.md) for setup and how to run them.

Here are comprehensive examples showing real-world usage patterns. All methods take a single **options object** — the older positional-argument style is no longer supported.

### Complete E-commerce Integration

```ts
import { createClient, type DestinationOption } from "monime-package";

// Initialize client
const client = createClient({
  monimeSpaceId: process.env.MONIME_SPACE_ID!,
  accessToken: process.env.MONIME_ACCESS_TOKEN!,
});

// Create business account
const businessAccount = await client.financialAccount.create({
  accountName: "E-commerce Store",
  currency: "SLE",
});
if (!businessAccount.success) {
  throw new Error(`Failed to create account: ${businessAccount.error?.message}`);
}

const accountId = businessAccount.data!.id;
console.log(`Created account: ${accountId}`);
console.log(`Balance: ${businessAccount.data!.balance.available.value} SLE`);

// Create checkout session for customer
const checkout = await client.checkoutSession.create({
  name: "Digital Camera",
  amount: 45000, // 450.00 SLE
  quantity: 1,
  successUrl: "https://store.com/success",
  cancelUrl: "https://store.com/cancel",
  description: "Professional DSLR Camera with lens kit",
  financialAccountId: accountId,
  primaryColor: "#2563EB", // Brand blue
  images: ["https://store.com/camera.jpg"],
});

if (checkout.success) {
  console.log(`Checkout created: ${checkout.data!.id}`);
  console.log(`Payment URL: ${checkout.data!.redirectUrl}`);
  console.log(`Order: ${checkout.data!.orderNumber}`);
}
```

### Payment Processing Workflow

```ts
// 1. Generate USSD payment code for customer
const paymentCode = await client.paymentCode.create({
  paymentName: "Invoice #INV-2024-001",
  amount: 15000, // 150.00 SLE
  financialAccountId: accountId,
  name: "Customer Name",
  phoneNumber: "0771234567",
});

if (paymentCode.success) {
  console.log(`USSD Code: ${paymentCode.data!.ussdCode}`);
  console.log(`Expires: ${paymentCode.data!.expireTime}`);

  // Send USSD code to customer via SMS/email
  await sendToCustomer(paymentCode.data!.ussdCode);
}

// 2. Monitor payment status
const checkPaymentStatus = async (codeId: string) => {
  const status = await client.paymentCode.retrieve(codeId);
  if (status.success) {
    console.log(`Payment Status: ${status.data!.status}`);
    return status.data!.status === "completed";
  }
  return false;
};

// 3. Process payout to supplier after payment received
const paySupplier = async () => {
  const payout = await client.payout.create({
    amount: 8000, // 80.00 SLE to supplier
    sourceAccount: accountId,
    destination: {
      type: "momo",
      providerId: "m17",
      phoneNumber: "0779876543",
    },
  });

  if (payout.success) {
    console.log(`Payout ID: ${payout.data!.id}`);
    console.log(`Status: ${payout.data!.status}`);
    console.log(`Fees: ${payout.data!.fees.map(f => `${f.code}: ${f.amount.value}`)}`);
  }
};
```

### Multi-Account Management

```ts
// Create multiple accounts for different purposes
const accounts = await Promise.all([
  client.financialAccount.create({ accountName: "Sales Revenue", currency: "SLE" }),
  client.financialAccount.create({ accountName: "Operating Expenses", currency: "SLE" }),
  client.financialAccount.create({ accountName: "Tax Reserve", currency: "SLE" }),
]);

// Check if all accounts were created successfully
if (accounts.every(acc => acc.success)) {
  const [salesAccount, expensesAccount, taxAccount] = accounts.map(acc => acc.data!.id);

  // Distribute revenue: 70% operations, 30% tax reserve
  const revenue = 100000; // 1000.00 SLE

  const transfers = await Promise.all([
    client.internalTransfer.create({
      sourceAccount: salesAccount,
      destinationAccount: expensesAccount,
      amount: revenue * 0.7,
    }),
    client.internalTransfer.create({
      sourceAccount: salesAccount,
      destinationAccount: taxAccount,
      amount: revenue * 0.3,
    }),
  ]);

  transfers.forEach((transfer, index) => {
    const purpose = index === 0 ? "operations" : "tax reserve";
    if (transfer.success) {
      console.log(`${purpose} transfer: ${transfer.data!.id}`);
    }
  });
}
```

### Transaction Monitoring & Reporting

```ts
// Transactions for reporting. `list()` is paginated — page through it with
// `pagination.next` when a report needs the full history.
const transactions = await client.financialTransaction.list({ limit: 50 });

if (transactions.success) {
  const txs = transactions.data!.result;
  
  // Group transactions by type
  const summary = txs.reduce((acc, tx) => {
    acc[tx.type] = (acc[tx.type] || 0) + tx.amount.value;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Transaction Summary:', summary);
  
  // Find large transactions (> 50,000 SLE)
  const largeTransactions = txs.filter(tx => Math.abs(tx.amount.value) > 50000);
  console.log(`Large transactions: ${largeTransactions.length}`);
  
  // Check account balances after transactions
  const accountIds = [...new Set(txs.map(tx => tx.financialAccount.id))];
  
  for (const accountId of accountIds) {
    const account = await client.financialAccount.retrieve(accountId);
    if (account.success) {
      console.log(`Account ${accountId}: ${account.data!.balance.available.value} SLE`);
    }
  }
}
```

### Error Handling Best Practices

```ts
import { randomUUID } from "node:crypto";
import {
  MonimeRateLimitError,
  MonimeValidationError,
} from "monime-package";

// Robust error handling with retries
const createTransferWithRetry = async (
  sourceAccount: string,
  destinationAccount: string,
  amount: number,
  maxRetries = 3
) => {
  // One key for the whole operation, so a retry is never a second transfer.
  const idempotencyKey = randomUUID();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const transfer = await client.internalTransfer.create(
      { sourceAccount, destinationAccount, amount },
      { idempotencyKey }
    );

    if (transfer.success) {
      return transfer;
    }

    const error = transfer.error;
    console.error(`Transfer attempt ${attempt} failed:`, error?.message);

    // Bad input will fail the same way every time — don't burn retries on it.
    if (error instanceof MonimeValidationError) {
      throw error;
    }

    if (attempt === maxRetries) break;

    // Honour Retry-After when we're being throttled, else exponential backoff.
    const delay =
      error instanceof MonimeRateLimitError && error.retryAfter
        ? error.retryAfter * 1000
        : 2 ** attempt * 1000;

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error(`Transfer failed after ${maxRetries} attempts`);
};

// Usage
try {
  const transfer = await createTransferWithRetry("fac-source", "fac-dest", 10000);
  console.log("Transfer successful:", transfer.data!.id);
} catch (error) {
  console.error("Transfer failed permanently:", (error as Error).message);
}
```

---

## Idempotency

Every create/update call attaches an `Idempotency-Key` header. If you don't supply one, the SDK generates a random key for that single call.

A generated key only guards against an accidental double-submit *inside* one call. To make **retries** safe you must pass the same key on every attempt — otherwise each retry looks like a brand-new operation to Monime:

```ts
import { randomUUID } from "node:crypto";

// One key per logical operation, reused across retries.
const idempotencyKey = randomUUID();

async function payoutWithRetry(attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = await client.payout.create(
      {
        amount: 100_00,
        sourceAccount: "fac-...",
        destination: { type: "momo", providerId: "m17", phoneNumber: "078000111" },
      },
      { idempotencyKey }, // same key each time
    );

    if (result.success) return result;
    if (attempt === attempts) return result;
  }
}
```

Keys are **Space-scoped**, so the same key used in two different Spaces never collides. Monime caches a successful result for 24 hours and de-duplicates at the transaction layer beyond that. Failed requests are *not* cached, so you can retry after a transient error with the same key.

Reusing a key with a *different* body or URL returns `409` with reason `idempotency_key_in_use`, surfaced as a `MonimeConflictError`. Keys are capped at 64 characters.

---

## Pagination

List endpoints use forward cursor pagination. Every `list()` accepts `{ limit?, after? }` and returns the cursor alongside the data:

```ts
const page = await client.payout.list({ limit: 30 });

page.data;       // the items
page.pagination; // { count: 30, next: "pyt-k6GMRZsCr61zfwCQtVemY2RrvQH" }
```

- **`limit`** — items per page. The API accepts 1–50 and defaults to 10.
- **`after`** — the cursor from the previous response's `pagination.next`.

`pagination.next` is `null` (or absent) on the final page. Cursors are opaque and query-specific — pass them back verbatim, never construct or edit one.

```ts
// Walk every page.
async function allPayouts() {
  const items = [];
  let after: string | undefined;

  do {
    const page = await client.payout.list({ limit: 50, ...(after && { after }) });
    if (!page.success) throw page.error;

    items.push(...(page.data ?? []));
    after = page.pagination?.next ?? undefined;
  } while (after);

  return items;
}
```

---

## Migration from Old Helpers

Previously, you called standalone helpers and passed credentials on every call:

```ts
// old (example)
createFinancialAccount("name", MONIME_SPACE_ID, MONIME_ACCESS_TOKEN);
```

Now, instantiate a client once and use namespaced methods. Credentials are stored internally:

```ts
const client = createClient({ monimeSpaceId, accessToken });
await client.financialAccount.create({ accountName: "name", currency: "SLE" });
```

---


## Error Handling

- **Standard envelope**: every call returns `{ success, data?, error? }`, plus `pagination` on list endpoints.
- **Validation**: inputs are validated (e.g. non-empty IDs, positive amounts) and will short-circuit with `success: false` + `MonimeValidationError`.
- **MonimeError**: remote errors are returned as `MonimeError` objects, which include:
  - `status`: HTTP status code (e.g. 401, 404)
  - `reason`: machine-readable cause from the API, e.g. `too_many_requests`
  - `requestId`: the `Monime-Request-Id` of the failed attempt — quote it in support tickets
  - `details`: the full error envelope from the API

### Error subclasses

| Class | Status | Notes |
|---|---|---|
| `MonimeValidationError` | 400 | Raised locally when input fails its Zod schema |
| `MonimeAuthenticationError` | 401 | Invalid or missing access token |
| `MonimeConflictError` | 409 | Usually `idempotency_key_in_use` — same key, different request |
| `MonimeRateLimitError` | 429 | Adds `retryAfter` (seconds) and `limit` (`token-limit`, `space-limit` or `endpoint-limit`) |
| `MonimeError` | any other | Base class for everything else |

```ts
import { MonimeRateLimitError } from "monime-package";

const result = await client.payout.list();

if (!result.success && result.error instanceof MonimeRateLimitError) {
  await new Promise((r) => setTimeout(r, (result.error.retryAfter ?? 1) * 1000));
}
```

---

## Security

- Do not commit tokens. Use environment variables or a secret manager.
- Restrict tokens to the least privileges necessary.

---

## Versioning

This project follows semantic versioning (SemVer). See releases for notable changes.

---

## Support

- File issues and feature requests at the repository: `https://github.com/Walon-Foundation/monime-package/issues`.
- For production incidents, rotate credentials if you suspect exposure.

## TypeScript Types

All result payload types are exported from the package for complete type safety:

```ts
import type {
  // Core types
  ClientOptions,
  
  // Payment types
  RetrievePaymentResponse,
  ListPaymentsResponse,
  UpdatePaymentResponse,
  
  // Webhook types
  CreateWebhookRequest,
  CreateWebhookResponse,
  GetWebhookResponse,
  ListWebhooksResponse,
  UpdateWebhookRequest,
  UpdateWebhookResponse,
  
  // Receipt types
  GetReceiptResponse,
  RedeemReceiptResponse,
  
  // USSD OTP types
  CreateUssdOtpRequest,
  CreateUssdOtpResponse,
  
  // Provider KYC types
  GetProviderKycResponse,
  
  // Financial Account types
  CreateFinancialAccountResponse,
  RetrieveFinancialAccountResponse,
  ListFinancialAccountsResponse,

  // Internal Transfer types
  CreateInternalTransferResponse,
  RetrieveInternalTransferResponse,
  ListInternalTransfersResponse,

  // Payment Code types
  CreatePaymentCodeResponse,
  ListPaymentCodesResponse,
  RetrievePaymentCodeResponse,

  // Payout types
  DestinationOption,
  CreatePayoutResponse,
  ListPayoutsResponse,
  RetrievePayoutResponse,

  // Financial Transaction types
  RetrieveTransactionResponse,
  ListTransactionsResponse,
  
  // Checkout Session types
  CreateCheckoutResponse,
  ListCheckoutsResponse,
  RetrieveCheckoutResponse,
} from "monime-package";
```

### Core Type Definitions

#### Result Envelope
All API responses follow this consistent pattern:
```ts
type Result<T> = {
  success: boolean;
  data?: T;
  error?: Error | MonimeError;
  pagination?: Pagination; // list endpoints only
};

type Pagination = {
  count: number;       // items in this page
  next: string | null; // cursor for the next page, null on the last one
};

type ListOptions = {
  limit?: number; // 1-50, defaults to 10
  after?: string; // cursor from a previous pagination.next
};

type MutationOptions = {
  idempotencyKey?: string; // reuse across retries; generated when omitted
};
```

#### Client Configuration
```ts
type ClientOptions = {
  monimeSpaceId?: string; // falls back to MONIME_SPACE_ID
  accessToken?: string;   // falls back to MONIME_ACCESS_TOKEN
  monimeVersion?: "caph.2025-08-23" | "caph.2025-06-20"; // falls back to MONIME_VERSION
};
```

#### Destination Options for Payouts
```ts
type DestinationOption = 
  | {
      type: "momo";
      providerId: "m17" | "m18"; // MTN, Orange Money
      phoneNumber: string;
    }
  | {
      type: "bank";
      providerId: "b01" | "b02" | "b03"; // Bank codes
      accountNumber: string;
    }
  | {
      type: "wallet";
      providerId: "w01" | "w02"; // Wallet provider codes
      walletId: string;
    };
```

### Response Type Details

#### Financial Account Types
```ts
// Account creation/retrieval response
interface CreateFinancialAccount {
  id: string;           // Unique account ID
  uvan: string;         // Internal identifier
  name: string;         // Account name
  currency: string;     // Always "SLE"
  reference: string;    // Account reference
  description: string;  // Account description
  balance: {
    available: {
      currency: string;
      value: number;    // Balance in cents (SLE)
    };
  };
  createTime: string;   // ISO timestamp
  updateTime: string;   // ISO timestamp
}
```

#### Internal Transfer Types
```ts
interface CreateInternalTransferResponse {
  id: string;                    // Transfer ID
  status: string;                // Transfer status
  amount: {
    currency: string;
    value: number;               // Amount in cents
  };
  sourceFinancialAccount: { id: string };
  destinationFinancialAccount: { id: string };
  financialTransactionReference: string;
  description: string;
  failureDetail: {
    code: string;
    message: string;
  };
  ownershipGraph: {
    owner: {
      id: string;
      type: string;
      owner: {
        id: string;
        type: string;
      };
    };
  };
  createTime: string;
  updateTime: string;
}
```

#### Payment Code Types
```ts
interface CreatePaymentCodeResponse {
  id: string;
  mode: string;              // "recurrent"
  status: string;            // Payment status
  name: string;              // Payment name
  amount: {
    currency: string;
    value: number;           // Amount in cents
  };
  enable: boolean;
  expireTime: string;        // ISO timestamp
  customer: { name: string };
  ussdCode: string;          // USSD code for payment
  reference: string;
  authorizedProviders: string[];
  authorizedPhoneNumber: string;
  recurrentPaymentTarget: {
    expectedPaymentCount: number;
    expectedPaymentTotal: {
      currency: string;
      value: number;
    };
  };
  financialAccountId: string;
  processedPaymentData: {
    amount: { currency: string; value: number };
    orderId: string;
    paymentId: string;
    orderNumber: string;
    channelData: {
      providerId: string;
      accountId: string;
      reference: string;
    };
    financialTransactionReference: string;
  };
  createTime: string;
  updateTime: string;
  ownershipGraph: OwnershipGraph;
}
```

#### Checkout Session Types
```ts
interface CreateCheckoutResponse {
  id: string;
  status: string;
  name: string;
  orderNumber: string;       // Generated order number
  reference: string;
  description: string;
  redirectUrl: string;       // Checkout page URL
  cancelUrl: string;
  successUrl: string;
  lineItems: {
    data: Array<{
      type: string;
      id: string;
      name: string;
      price: { currency: string; value: number };
      quantity: number;
      reference: string;
      description: string;
      images: string[];
    }>;
  };
  financialAccountId: string;
  brandingOptions: {
    primaryColor: string;
  };
  expireTime: string;
  createTime: string;
  ownershipGraph: OwnershipGraph;
}
```

#### Common Types
```ts
// Pagination for list responses
interface Pagination {
  count: number;       // Number of items in this page (not a grand total)
  next: string | null; // Cursor for the next page; null on the last page
}

// Ownership information
interface OwnershipGraph {
  owner: {
    id: string;
    type: string;
    owner: {
      id: string;
      type: string;
    };
  };
}

// Amount representation
interface Amount {
  currency: string; // Always "SLE"
  value: number;    // Amount in cents (multiply by 100 for SLE)
}
```

### Type Usage Examples

```ts
// Type-safe account creation
const createAccountTyped = async (name: string): Promise<CreateFinancialAccountResponse | null> => {
  const result = await client.financialAccount.create({
    accountName: name,
    currency: "SLE"
  });
  return result.success ? result.data! : null;
};

// Type-safe payout with validation
const createMobileMoneyPayout = async (
  amount: number,
  phoneNumber: string,
  sourceAccount: string
): Promise<CreatePayoutResponse | null> => {
  const result = await client.payout.create({
    amount,
    sourceAccount,
    destination: {
      type: "momo",
      providerId: "m17",
      phoneNumber,
    }
  });
  return result.success ? result.data! : null;
};

// Type-safe transaction processing
const processTransactions = async (): Promise<void> => {
  const txResult = await client.financialTransaction.list();
  
  if (txResult.success && txResult.data) {
    const transactions: ListTransactionsResponse = txResult.data;
    
    transactions.result.forEach((tx: RetrieveTransactionResponse) => {
      console.log(`Transaction ${tx.id}: ${tx.amount.value / 100} ${tx.amount.currency}`);
    });
  }
};
```

---

## Contributing


We welcome contributions.

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies** with `pnpm install`
4. **Create a feature branch** from `main`
5. **Make your changes** following our coding conventions
6. **Run linting** with `pnpm lint-format`
7. **Test your changes** with `pnpm test`
8. **Build the package** with `pnpm build`
9. **Submit a pull request** with a clear description

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## License

MIT — see [LICENSE](./LICENSE).

This is an unofficial, independent project and is **not affiliated with or endorsed by Monime Ltd.** All product names, trademarks, and registered trademarks are the property of their respective owners.

---

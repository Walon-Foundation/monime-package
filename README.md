
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
MONIME_VERSION=caph.2025-08-23 # Optional; caph.2025-08-23 is sent when unset
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
import { createClient, type PayoutDestination } from "monime-package";

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

Every `list()` takes optional [pagination](#pagination) (`{ limit?, after? }`)
plus the filters that endpoint supports. On a list call `data` is the page
itself (an array); the cursor is in `pagination`. Every create and update
takes an optional trailing [`MutationOptions`](#idempotency), so you can supply
your own idempotency key.

**Amounts are always in minor units** (cents): `{ value: 1050 }` is SLE 10.50,
on every endpoint. `currency` is `"SLE"` (the default) or `"USD"`.

**Metadata** is a flat map of strings: at most 64 pairs, keys of 1-64
characters from `[a-zA-Z0-9_-]` that don't begin with `_`, `-` or `monime`, and
values of at most 100 characters. On update, `null` or `""` deletes a key.

Inputs are validated before any request is sent, so an invalid call never
reaches the API: it returns `{ success: false, error }` with a
`MonimeValidationError`.

The client exposes namespaced APIs under `client.<module>`:

### Payments

Incoming payments (payins).

```ts
client.payment.retrieve(paymentId: string): Promise<Result<Payment>>

client.payment.list(options?: {
  limit?, after?,
  orderNumber?: string,
  financialAccountId?: string,
  financialTransactionReference?: string,
}): Promise<Result<Payment[]>>

client.payment.update(paymentId: string, body: {
  name?: string | null,          // at most 100 characters
  metadata?: MetadataInput | null,
}, requestOptions?: MutationOptions): Promise<Result<Payment>>
```

A payment's `status` is `pending`, `processing` or `completed`: the API has no
failed state for payments. `channel` says how it was paid (`momo`, `bank`,
`card` or `wallet`, with the provider, reference and phone or account number).

### Webhooks

Register endpoints for event notifications, and verify what they receive.

```ts
client.webhook.create({
  name: string,                    // 1-100 characters
  url: string,                     // at most 255 characters
  events: string[],                // 1-100 names, e.g. "payout.completed"
  enabled?: boolean,               // default true
  apiRelease?: "caph" | "siriusb", // default "caph"
  headers?: Record<string, string>,
  alertEmails?: string[],          // at most 2
  verificationMethod?:
    | { type: "HS256"; secret: string } // 32-256 characters
    | { type: "ES256" },                // Monime returns a PEM public key
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<Webhook>>

client.webhook.retrieve(webhookId: string): Promise<Result<Webhook>>
client.webhook.list(options?: ListOptions): Promise<Result<Webhook[]>>

// The verification method cannot change: create a new webhook to rotate it.
client.webhook.update(webhookId: string, body: {
  name?, url?, enabled?, apiRelease?, events?, headers?, alertEmails?, metadata?
}, requestOptions?: MutationOptions): Promise<Result<Webhook>>

client.webhook.delete(webhookId: string): Promise<Result<void>>
```

The event names available on the `caph` release are exported as
`WEBHOOK_EVENTS`.

#### Verifying deliveries

Every delivery carries a `Monime-Signature: t=<unix>,v1=<base64>` header,
signed over `t + "_" + rawBody`. Verify it against the **raw** body, before
parsing it:

```ts
import { parseWebhookEvent } from "monime-package";

// e.g. in an Express handler using express.raw({ type: "application/json" })
const event = parseWebhookEvent({
  payload: req.body,                          // the raw bytes or string
  header: req.header("monime-signature"),
  secret: process.env.MONIME_WEBHOOK_SECRET,  // HS256 webhooks
  // publicKey: process.env.MONIME_WEBHOOK_PUBLIC_KEY, // ES256 webhooks (PEM)
});

if (!event.success) {
  return res.status(401).end(); // event.error.reason says why
}

// Deliveries can repeat: de-duplicate on event.data.event.id. `data` is a
// partial snapshot, so fetch the object by event.data.object.id if you need more.
switch (event.data!.event.name) {
  case "payout.completed":
  case "payout.failed":
    // ...
}
res.status(200).end();
```

`verifyWebhookSignature(options)` does the check without decoding. Both refuse
a delivery more than 300 seconds old or more than 60 seconds in the future
(set `tolerance` and `futureTolerance` to change that), and both accept
several `v1` values, for key rotation. Neither throws: a failure returns
`{ success: false, error }` with a `MonimeWebhookSignatureError` whose `reason`
is one of `missing_header`, `malformed_header`, `timestamp_out_of_tolerance`,
`signature_mismatch`, `invalid_public_key`, `missing_verification_key` or
`malformed_payload`.

### Receipts

```ts
client.receipt.retrieve(orderNumber: string): Promise<Result<Receipt>>

client.receipt.redeem(orderNumber: string, body?: {
  redeemAll?: boolean,
  entitlements?: { key: string; units?: number }[], // units default to 1
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<{ redeem: boolean; receipt: Receipt }>>
```

### USSD OTPs

```ts
client.ussdOtp.create({
  authorizedPhoneNumber: string,
  verificationMessage?: string, // at most 255 characters
  duration?: string,            // default "5m"
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<UssdOtp>>

client.ussdOtp.retrieve(ussdOtpId: string): Promise<Result<UssdOtp>>
client.ussdOtp.list(options?: ListOptions): Promise<Result<UssdOtp[]>>
client.ussdOtp.delete(ussdOtpId: string): Promise<Result<void>>
```

### Provider KYC

Look up the registered holder of an account at a provider, for example to
check a payee's name before a payout.

```ts
client.providerKyc.retrieve(
  providerId: string, // e.g. "m17", "slb001"
  accountId: string,  // the phone number or account number at that provider
): Promise<Result<{
  account: { id: string; name: string; holderName: string; metadata: Metadata | null };
  provider: { id: string; type: "momo" | "bank" | "wallet"; name: string };
}>>
```

### Financial Providers (Banks & MoMo)

The banks and mobile money providers operating in a country. The API requires
the country.

```ts
client.financialProvider.bank.retrieve(providerId: string): Promise<Result<Bank>>
client.financialProvider.bank.list(country: string, options?: ListOptions): Promise<Result<Bank[]>>

client.financialProvider.momo.retrieve(providerId: string): Promise<Result<Momo>>
client.financialProvider.momo.list(country: string, options?: ListOptions): Promise<Result<Momo[]>>
```

**Example:**
```ts
// Which mobile money providers can receive payouts in Sierra Leone?
const providers = await client.financialProvider.momo.list("SL");
if (providers.success) {
  for (const p of providers.data!) {
    console.log(p.providerId, p.name, p.featureSet.payout.canPayTo);
  }
}
```

### Financial Accounts

```ts
client.financialAccount.create({
  accountName: string,     // sent as `name`; at most 100 characters
  currency: "SLE" | "USD",
  reference?: string,      // your own reference, unique in the Space; at most 64
  description?: string,    // at most 150 characters
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<FinancialAccount>>

// `balance` is null unless you ask for it
client.financialAccount.retrieve(financialAccountId: string, options?: {
  withBalance?: boolean,
}): Promise<Result<FinancialAccount>>

client.financialAccount.list(options?: {
  limit?, after?, uvan?: string, reference?: string, withBalance?: boolean,
}): Promise<Result<FinancialAccount[]>>

client.financialAccount.update(financialAccountId: string, body: {
  name?: string | null, reference?: string | null,
  description?: string | null, metadata?: MetadataInput | null,
}, requestOptions?: MutationOptions): Promise<Result<FinancialAccount>>
```

**Example:**
```ts
const account = await client.financialAccount.create({
  accountName: "Org 7",
  currency: "SLE",
  reference: "org-7",
});
if (account.success) {
  console.log("Account ID:", account.data!.id, "UVAN:", account.data!.uvan);
}

const details = await client.financialAccount.retrieve("fac-123456", {
  withBalance: true,
});
console.log(details.data?.balance?.available.value); // minor units
```

### Internal Transfers

Move money between financial accounts in the same Space.

```ts
client.internalTransfer.create({
  sourceAccount: string,
  destinationAccount: string,
  amount: number,           // minor units
  currency?: "SLE" | "USD", // default "SLE"
  description?: string,     // at most 150 characters
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<InternalTransfer>>

client.internalTransfer.retrieve(internalTransferId: string): Promise<Result<InternalTransfer>>

client.internalTransfer.list(options?: {
  limit?, after?,
  status?: "pending" | "processing" | "failed" | "completed",
  sourceFinancialAccountId?, destinationFinancialAccountId?, financialTransactionReference?,
}): Promise<Result<InternalTransfer[]>>

// description (at most 255 characters) and metadata, while pending
client.internalTransfer.update(internalTransferId: string, body: {
  description?: string | null, metadata?: MetadataInput | null,
}, requestOptions?: MutationOptions): Promise<Result<InternalTransfer>>

client.internalTransfer.delete(internalTransferId: string): Promise<Result<void>>
```

**Example:**
```ts
import { idempotencyKeyFor } from "monime-package";

const transfer = await client.internalTransfer.create(
  { sourceAccount: "fac-source", destinationAccount: "fac-dest", amount: 100000 }, // SLE 1,000.00
  { idempotencyKey: idempotencyKeyFor("transfer:invoice-42") },
);
```

### Payment Codes

USSD codes a customer dials to pay you. Field names match the API.

```ts
client.paymentCode.create({
  name: string,                        // 3-64 characters, shown to the payer
  mode?: "one_time" | "recurrent",     // default "one_time"
  enable?: boolean,                    // default true
  amount?: { currency?: "SLE" | "USD"; value: number }, // minor units
  duration?: string,                   // default "10m", e.g. "1h30m"
  customer?: { name?: string },
  reference?: string,                  // at most 64 characters
  authorizedProviders?: ("m17" | "m18")[],
  authorizedPhoneNumber?: string,      // only this number may pay
  recurrentPaymentTarget?: {           // for recurrent codes
    expectedPaymentCount?: number,
    expectedPaymentTotal?: { currency?: "SLE" | "USD"; value: number },
  },
  financialAccountId?: string,         // fac-…; the main account otherwise
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<PaymentCode>>

client.paymentCode.retrieve(paymentCodeId: string): Promise<Result<PaymentCode>>

client.paymentCode.list(options?: {
  limit?, after?, ussdCode?: string, mode?: "one_time" | "recurrent",
  status?: "pending" | "cancelled" | "processing" | "expired" | "completed",
}): Promise<Result<PaymentCode[]>>

// Any create field; null clears it
client.paymentCode.update(paymentCodeId: string, body: UpdatePaymentCodeOptions,
  requestOptions?: MutationOptions): Promise<Result<PaymentCode>>

client.paymentCode.delete(paymentCodeId: string): Promise<Result<void>>
```

**Example:**
```ts
const paymentCode = await client.paymentCode.create({
  name: "Order #12345",
  amount: { value: 5000 }, // SLE 50.00
  customer: { name: "John Doe" },
  authorizedPhoneNumber: "+23277123456",
  financialAccountId: "fac-123456",
});

if (paymentCode.success) {
  console.log("USSD Code:", paymentCode.data!.ussdCode);
  console.log("Expires at:", paymentCode.data!.expireTime);
}
```

### Payouts

Send money to mobile money, a bank or a wallet.

```ts
client.payout.create({
  amount: number,                 // minor units
  currency?: "SLE" | "USD",       // default "SLE"
  destination: PayoutDestination,
  sourceAccount?: string,         // the Space's main account when left out
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<Payout>>

client.payout.list(options?: {
  limit?, after?,
  status?: "pending" | "processing" | "completed" | "failed",
  sourceFinancialAccountId?, sourceTransactionReference?, destinationTransactionReference?,
}): Promise<Result<Payout[]>>

client.payout.retrieve(payoutId: string): Promise<Result<Payout>>

// metadata only, before processing
client.payout.update(payoutId: string, body: { metadata?: MetadataInput | null },
  requestOptions?: MutationOptions): Promise<Result<Payout>>

// cancel, before processing
client.payout.delete(payoutId: string): Promise<Result<void>>
```

**Destinations:**
```ts
type PayoutDestination =
  | { type: "momo"; providerId: "m17" | "m18"; phoneNumber: string }           // Orange, Africell
  | { type: "bank"; providerId: "slb001" | "slb004" | "slb007"; accountNumber: string }
  | { type: "wallet"; providerId: "dw001"; walletId?: string };
```

The provider IDs above are the ones in the API spec, and are exported as
`MOMO_PROVIDER_IDS`, `BANK_PROVIDER_IDS` and `WALLET_PROVIDER_IDS`. Any other ID
the API accepts works too; list the current ones with
`client.financialProvider.bank.list("SL")`.

A payout's `status` runs `pending` → `processing` → `completed` or `failed`. A
failed payout's `failureDetail.code` is one of `PAYOUT_FAILURE_CODES`
(`fund_insufficient`, `provider_account_blocked`, …). Fees are charged on top
of the amount and appear in `fees` once processed.

**Example:**
```ts
import { idempotencyKeyFor } from "monime-package";

// Reuse the same key when retrying, or a timeout followed by a retry can pay twice.
const payout = await client.payout.create(
  {
    amount: 10000, // SLE 100.00
    destination: { type: "momo", providerId: "m17", phoneNumber: "+23276123456" },
    sourceAccount: "fac-123456",
    metadata: { invoice: "inv-42" },
  },
  { idempotencyKey: idempotencyKeyFor("payout:inv-42:1") },
);
```

### Financial Transactions

The ledger of a financial account.

```ts
client.financialTransaction.retrieve(transactionId: string): Promise<Result<FinancialTransaction>>

client.financialTransaction.list(options?: {
  limit?, after?, financialAccountId?: string, reference?: string, type?: "credit" | "debit",
}): Promise<Result<FinancialTransaction[]>>
```

The API has no date filter: page through with the cursor. An entry that
reverses another carries `originatingReversal`; a fee carries `originatingFee`.

**Example:**
```ts
const transactions = await client.financialTransaction.list({
  financialAccountId: "fac-123456",
  limit: 50,
});
if (transactions.success) {
  for (const tx of transactions.data!) {
    console.log(`${tx.type}: ${tx.amount.value} ${tx.amount.currency}`);
  }
  console.log("More pages?", transactions.pagination?.next != null);
}
```

### Checkout Sessions

Hosted payment pages. Field names match the API.

```ts
client.checkoutSession.create({
  name: string,                  // at most 150 characters
  lineItems: {                   // 1 to 16
    name: string,                // at most 100 characters
    price: { currency?: "SLE" | "USD"; value: number }, // minor units
    quantity?: number,           // 1-100000, default 1
    reference?: string,
    description?: string,
    images?: string[],           // up to 3
  }[],
  description?: string,          // at most 1000 characters
  successUrl?: string,
  cancelUrl?: string,
  callbackState?: string,
  reference?: string,
  financialAccountId?: string,   // the main account otherwise
  paymentOptions?: {             // every method is on by default
    card?: { disable?: boolean },
    bank?: { disable?, enabledProviders?, disabledProviders? },
    momo?: { disable?, enabledProviders?, disabledProviders? },
    wallet?: { disable?, enabledProviders?, disabledProviders? },
  },
  brandingOptions?: { primaryColor?: string },
  metadata?: MetadataInput,
}, requestOptions?: MutationOptions): Promise<Result<CheckoutSession>>

client.checkoutSession.list(options?: ListOptions): Promise<Result<CheckoutSession[]>>
client.checkoutSession.retrieve(checkoutId: string): Promise<Result<CheckoutSession>>
client.checkoutSession.delete(checkoutId: string): Promise<Result<void>>
```

**Example:**
```ts
const checkout = await client.checkoutSession.create({
  name: "Premium Subscription",
  lineItems: [{ name: "Premium (1 month)", price: { value: 2500 } }], // SLE 25.00
  successUrl: "https://myapp.com/success",
  cancelUrl: "https://myapp.com/cancel",
  reference: "sub-0001",
  brandingOptions: { primaryColor: "#3B82F6" },
});

if (checkout.success) {
  // Send the customer to the hosted page
  console.log("Checkout URL:", checkout.data!.redirectUrl);
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
- **Headers**: SDK automatically sets `Authorization`, `Monime-Space-Id`, `Monime-Version` (`caph.2025-08-23` unless you configure another) and `Idempotency-Key` (on create/update) for each call.

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
│   ├── error.ts            # MonimeError and its subclasses (auth, conflict, rate limit, webhook signature)
│   ├── idempotency.ts      # idempotencyKeyFor: stable UUIDv5 keys from your own references
│   ├── webhookSignature.ts # verifyWebhookSignature / parseWebhookEvent
│   ├── resources/          # One file per API resource (payment.ts, payout.ts, …)
│   ├── types/              # TypeScript request/response interfaces per resource
│   └── validators/         # Zod schemas used to validate inputs before a request
├── test/
│   ├── e2e/                # End-to-end tests per resource
│   └── unit/               # Unit tests: validators, idempotency keys, webhook signatures
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
import { createClient, type PayoutDestination } from "monime-package";

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
console.log(`UVAN for deposits: ${businessAccount.data!.uvan}`);

// Create checkout session for customer
const checkout = await client.checkoutSession.create({
  name: "Digital Camera",
  description: "Professional DSLR Camera with lens kit",
  successUrl: "https://store.com/success",
  cancelUrl: "https://store.com/cancel",
  financialAccountId: accountId,
  lineItems: [
    {
      name: "DSLR camera with lens kit",
      price: { value: 45000 }, // 450.00 SLE
      images: ["https://store.com/camera.jpg"],
    },
  ],
  brandingOptions: { primaryColor: "#2563EB" }, // Brand blue
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
  name: "Invoice #INV-2024-001",
  amount: { value: 15000 }, // 150.00 SLE, in minor units
  financialAccountId: accountId,
  customer: { name: "Customer Name" },
  authorizedPhoneNumber: "+23277123456",
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
      phoneNumber: "+23279876543",
    },
  });

  if (payout.success) {
    console.log(`Payout ID: ${payout.data!.id}`);
    console.log(`Status: ${payout.data!.status}`);
    // Fees are charged on top of the amount; empty until processed.
    console.log(`Fees: ${(payout.data!.fees ?? []).map(f => `${f.code}: ${f.amount.value}`)}`);
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
  const txs = transactions.data!; // a list call's data is the page itself
  
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
    const account = await client.financialAccount.retrieve(accountId, { withBalance: true });
    if (account.success) {
      console.log(`Account ${accountId}: ${account.data!.balance?.available.value} (minor units)`);
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

A generated key only guards against an accidental double-submit *inside* one call. To make **retries** safe you must pass the same key on every attempt — otherwise each retry looks like a brand-new operation to Monime, and a timeout followed by a retry can pay twice.

The simplest way is to derive the key from your own record with `idempotencyKeyFor(reference)`. It returns a UUIDv5 of the reference, as Monime's idempotency guide recommends, so the same reference always gives the same key, even across processes and restarts (the Go SDK derives the same key from the same reference):

```ts
import { idempotencyKeyFor } from "monime-package";

// One key per logical operation, reused across retries. Change the attempt
// number only when you deliberately make a new attempt after a definite failure.
const idempotencyKey = idempotencyKeyFor("payout:invoice-42:1");

async function payoutWithRetry(attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = await client.payout.create(
      {
        amount: 100_00, // minor units: SLE 100.00
        sourceAccount: "fac-...",
        destination: { type: "momo", providerId: "m17", phoneNumber: "+23278000111" },
      },
      { idempotencyKey }, // same key each time
    );

    if (result.success) return result;
    if (attempt === attempts) return result;
  }
}
```

Keys are **Space-scoped**, so the same key used in two different Spaces never collides. Monime caches a successful result for 24 hours and de-duplicates at the transaction layer beyond that. Failed requests are *not* cached, so you can retry after a transient error with the same key.

Reusing a key with a *different* body or URL returns `409` with reason `idempotency_key_in_use`, surfaced as a `MonimeConflictError`. A key must be 1 to 64 characters; anything else is refused before the request is sent.

---

## Pagination

List endpoints use forward cursor pagination. Every `list()` accepts `{ limit?, after? }` and returns the cursor alongside the data:

```ts
const page = await client.payout.list({ limit: 30 });

page.data;       // the items: the page itself, an array
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
| `MonimeWebhookSignatureError` | 401 | Returned locally by `verifyWebhookSignature` / `parseWebhookEvent`; `reason` says what failed |
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

This project follows semantic versioning (SemVer). Notable changes, and how to migrate across a major version, are in [`CHANGELOG.md`](./CHANGELOG.md).

---

## Support

- File issues and feature requests at the repository: `https://github.com/Walon-Foundation/monime-package/issues`.
- For production incidents, rotate credentials if you suspect exposure.

## TypeScript Types

Every request and response type is exported from the package. The source of
truth is [`src/types/`](./src/types); the main ones are:

```ts
import type {
  // Core
  ClientOptions, Result, Pagination, ListOptions, MutationOptions,
  Amount, AmountInput, Currency, Metadata, MetadataInput, OwnershipGraph, Fee,

  // Resources (each has Create/Retrieve/Update/List*Response aliases too)
  FinancialAccount, InternalTransfer, Payout, PayoutDestination, PayoutStatus,
  PayoutFailureCode, PaymentCode, CheckoutSession, Payment, PaymentChannel,
  FinancialTransaction, Receipt, UssdOtp, Webhook, ProviderKyc, Bank, Momo,

  // Request options
  CreateFinancialAccountOptions, CreatePayoutOptions, CreateInternalTransferOptions,
  CreatePaymentCodeOptions, UpdatePaymentCodeOptions, CreateCheckoutOptions,
  CreateWebhookRequest, UpdateWebhookRequest, CreateUssdOtpRequest, RedeemReceiptOptions,

  // Webhook deliveries
  WebhookEvent, WebhookEventName, WebhookVerifyOptions,
} from "monime-package";
```

A few rules hold everywhere:

- **Amounts** are `{ currency, value }` with `value` in minor units (cents).
- **List responses** are arrays: `ListPayoutsResponse` is `Payout[]`, and the
  cursor is on `result.pagination`.
- **Nullable fields** follow the API: `balance` is null unless asked for with
  `withBalance`, `fees` stays null until a payout is processed, and so on.

```ts
// Type-safe mobile money payout
const pay = async (
  amount: number, // minor units
  phoneNumber: string,
  reference: string,
): Promise<Payout | null> => {
  const result = await client.payout.create(
    { amount, destination: { type: "momo", providerId: "m17", phoneNumber } },
    { idempotencyKey: idempotencyKeyFor(`payout:${reference}`) },
  );
  return result.success ? result.data! : null;
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

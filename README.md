
# monime-package

Official, lightweight TypeScript SDK for Monime. It provides a typed client for common Monime endpoints with consistent results and simple ergonomics.

![npm version](https://img.shields.io/npm/v/monime-package.svg)
![npm downloads](https://img.shields.io/npm/dm/monime-package.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-%3E=14-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

Package: `monime-package`

---

## Table of Contents

- **[Features](#features)**
- **[Installation](#installation)**
- **[Environment Variables](#environment-variables)**
- **[Quick Start](#quick-start)**
- **[Client API](#client-api)**
- **[Configuration](#configuration)**
- **[Examples](#examples)**
- **[Idempotency](#idempotency)**
- **[Pagination](#pagination)**
- **[Migration from Old Helpers](#migration-from-old-helpers)**
- **[Folder Structure](#folder-structure)**
- **[Error Handling](#error-handling)**
- **[Security](#security)**
- **[Versioning](#versioning)**
- **[Support](#support)**
- **[Return Types (Appendix)](#return-types-appendix)**
- **[Contributing](#contributing)**
- **[License](#license)**

---

## Features

- **Typed** request/response objects for safer integrations
- **Predictable** return shape: `{ success, data?, error? }`
- **Client-based** auth: set credentials once per instance
- **Minimal deps** (`axios`) and small surface area

---

## Installation

```bash
npm install monime-package
# or
pnpm add monime-package
```

---

## Environment Variables

Recommended to store credentials in `.env`:

```bash
MONIME_SPACE_ID=space_XXXXXXXX
MONIME_ACCESS_TOKEN=sk_live_xxx
```

You can also pass credentials directly when creating the client.

---

## Quick Start

### Create a client

```ts
import { createClient } from "monime-package";

const client = createClient({
  monimeSpaceId: process.env.MONIME_SPACE_ID!,
  accessToken: process.env.MONIME_ACCESS_TOKEN!,
});
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

## Client API

All methods return the same envelope:

```ts
type Result<T> = {
  success: boolean;
  data?: T;
  error?: Error;
};
```

The client exposes namespaced APIs under `client.<module>`:

### financialAccount

```ts
client.financialAccount.create(name: string): Promise<Result<CreateFinancialAccount>>
client.financialAccount.get(financialAccountId: string): Promise<Result<GetFinancialAccount>>
client.financialAccount.getAll(): Promise<Result<AllFinancialAccount>>
```

### internalTransfer

```ts
client.internalTransfer.create(
  sourceAccount: string,
  destinationAccount: string,
  amount: number,
): Promise<Result<CreateInternalTransfer>>

client.internalTransfer.get(internalTransferId: string): Promise<Result<InternalTransfer>>
client.internalTransfer.getAll(): Promise<Result<AllInternalTransfers>>
client.internalTransfer.delete(internalTransferId: string): Promise<{ success: boolean; error?: Error }>
```

### paymentCode

```ts
client.paymentCode.create(
  paymentName: string,
  amount: number,
  financialAccount: string,
  username: string,
  phoneNumber: string,
): Promise<Result<CreatePaymentCode>>

client.paymentCode.delete(paymentCodeId: string): Promise<{ success: boolean; error?: Error }>
client.paymentCode.getAll(): Promise<Result<GetAllPaymentCode>>
client.paymentCode.get(paymentCodeId: string): Promise<Result<GetOne>>
```

### payout

```ts
import type { DestinationOption } from "monime-package";

client.payout.create(
  amount: number,
  destination: DestinationOption,
  sourceAccount: string,
): Promise<Result<CreatePayout>>

client.payout.get(): Promise<Result<GetAll>>
client.payout.getOne(payoutId: string): Promise<Result<GetOnePayout>>
client.payout.delete(payoutId: string): Promise<{ success: boolean; error?: Error }>
```

### financialTransaction

```ts
client.financialTransaction.get(transactionId: string): Promise<Result<GetTransaction>>
client.financialTransaction.getAll(): Promise<Result<AllTransaction>>
```

---

## Configuration

The client accepts the following options (see `src/client.ts`):

```ts
type ClientOptions = {
  monimeSpaceId: string; // Your Monime Space ID
  accessToken: string;   // Your Monime API token
};
```

- **Authentication**: Both values are required. Prefer environment variables.
- **Headers**: SDK automatically sets `Authorization` and `Monime-Space-Id` for each call.

---

## Examples

### Create a financial account

```ts
const account = await client.financialAccount.create("App Wallet");
if (!account.success) throw account.error;
console.log(account.data);
```

### Get account details

```ts
const details = await client.financialAccount.get(account.data!.result.id);
console.log(details);
```

### List financial accounts

```ts
const all = await client.financialAccount.getAll();
console.log(all.data?.result.length);
```

### Internal transfer

```ts
const transfer = await client.internalTransfer.create("acc-src", "acc-dest", 5000);
if (!transfer.success) console.error(transfer.error);
else console.log(transfer.data);
```

### Payment code lifecycle

```ts
// create
const code = await client.paymentCode.create(
  "Order-001",
  5,
  "financial-account-id",
  "Alice",
  "0771234567",
);
if (!code.success) console.error(code.error);
else console.log("Payment code:", code.data);

// get
const one = await client.paymentCode.get("payment-code-id");

// list
const codes = await client.paymentCode.getAll();

// delete
const deleted = await client.paymentCode.delete("payment-code-id");
console.log(deleted.success);
```

### Payouts

```ts
import type { DestinationOption } from "monime-package";

const destination: DestinationOption = {
  type: "momo",
  providerId: "m17", // eg. provider code
  phoneNumber: "0771234567",
};

const payout = await client.payout.create(1000, destination, "source-account-id");
if (!payout.success) console.error(payout.error);
else console.log("Payout:", payout.data);

// list all payouts
const payouts = await client.payout.get();

// get one
const single = await client.payout.getOne("payout-id");

// delete
const removed = await client.payout.delete("payout-id");
```

### Financial transactions

```ts
const tx = await client.financialTransaction.get("transaction-id");
const txs = await client.financialTransaction.getAll();
```

---

## Idempotency

For POST endpoints, the SDK automatically attaches an `Idempotency-Key` header. This helps prevent duplicate requests if you retry the same call. Keys are generated per module instance.

---

## Pagination

List endpoints return a `pagination` object in `data?.pagination` when available, including a `next` cursor/URL. The SDK currently returns this information as-is; use the `next` value to fetch subsequent pages if needed.

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
await client.financialAccount.create("name");
```

---

## Folder Structure

```
.
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src
│   ├── index.ts               # entry point (exports createClient, types)
│   ├── client.ts              # MonimeClient with namespaced modules
│   └── modules/
│       ├── financialAccount/
│       │   ├── financialAccount.ts
│       │   └── index.ts
│       ├── financialTransaction/
│       │   ├── financialTransaction.ts
│       │   └── index.ts
│       ├── internalTransfer/
│       │   ├── internalTransfer.ts
│       │   └── index.ts
│       ├── paymentCode/
│       │   ├── paymentCode.ts
│       │   └── index.ts
│       ├── payout/
│       │   ├── payout.ts
│       │   └── index.ts
│       └── types.ts
```

---

## Error Handling

- **Standard envelope**: every call returns `{ success, data?, error? }`.
- **Validation**: inputs are validated (e.g. non-empty IDs, positive amounts) and will short-circuit with `success: false` + `Error`.
- **Axios errors**: when available, `axios` errors are propagated. You can check details with `axios.isAxiosError(error)`.

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

---

## Return Types (Appendix)

All result payload types are exported from the package, so you can import them directly:

```ts
import type {
  // Financial Account
  CreateFinancialAccount,
  GetFinancialAccount,
  AllFinancialAccount,

  // Internal Transfer
  CreateInternalTransfer,
  InternalTransfer,
  AllInternalTransfers,

  // Payment Code
  CreatePaymentCode,
  GetAllPaymentCode,
  GetOne,

  // Payout
  DestinationOption,
  CreatePayout,
  GetAll,
  GetOnePayout,

  // Financial Transaction
  GetTransaction,
  AllTransaction,
} from "monime-package";
```

- **financialAccount**
  - `CreateFinancialAccount`: `{ success, messages, result: { id, name, currency, balance, ... } }`
  - `GetFinancialAccount`: same `result` shape as above
  - `AllFinancialAccount`: `{ result: Result[], pagination: { count, next } }`

- **internalTransfer**
  - `CreateInternalTransfer`: `{ result: { id, status, amount, sourceFinancialAccount, destinationFinancialAccount, ... } }`
  - `InternalTransfer`: same `result` shape for a single transfer
  - `AllInternalTransfers`: `{ result: Result[], pagination }`

- **paymentCode**
  - `CreatePaymentCode`: created payment code details
  - `GetAllPaymentCode`: list of codes with pagination
  - `GetOne`: details for a specific payment code

- **payout**
  - `DestinationOption`: union for destination types (`momo`, `bank`, `wallet`)
  - `CreatePayout`: created payout info with `fees`, `destination`, etc.
  - `GetAll`: list of payouts with pagination
  - `GetOnePayout`: details for a specific payout

- **financialTransaction**
  - `GetTransaction`: details for a transaction (amount, reference, ownershipGraph, ...)
  - `AllTransaction`: list of transactions with pagination

These types mirror Monime API responses and are kept minimal and typed for convenience.

---

## Contributing


We welcome contributions.

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding conventions
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## License

MIT — see [LICENSE](./LICENSE).

---

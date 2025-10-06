
# monime-package

A **TypeScript SDK for Monime**, providing a lightweight, typed client for common Monime endpoints. Simplifies requests, headers, and error handling so your code stays clean and type-safe.

![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-%3E=14-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

Package: `monime-package`

---

## Table of Contents

* [Features](#features)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Quick Start](#quick-start)
* [Client API](#client-api)
* [Examples](#examples)
* [Migration from Old Helpers](#migration-from-old-helpers)
* [Folder Structure](#folder-structure)
* [Error Handling](#error-handling)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* Full **TypeScript support** with typed request/response objects
* Lightweight client wrapper around Monime endpoints
* Predictable return shape: `{ success: boolean, data?, error? }`
* Single client instance handles credentials automatically
* Minimal dependencies (`axios` only)

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
import { createClient } from 'monime-package'

const client = createClient({
  monimeSpaceeId: process.env.MONIME_SPACE_ID!,
  accessToken: process.env.MONIME_ACCESS_TOKEN!,
})
```

Now all methods automatically use the client’s credentials.

---

## Client API

All methods return:

```ts
type Result<T> = {
  success: boolean
  data?: T
  error?: Error
}
```

### Financial Accounts

```ts
client.createFinancialAccount(name: string): Promise<Result<CreateFinancialAccount>>
client.getFinancialAccount(financialAccountId: string): Promise<Result<GetFinancialAccount>>
```

### Internal Transfers

```ts
client.createInternalTransfer(
  sourceAccount: string,
  destinationAccount: string,
  amount: number
): Promise<Result<CreateInternalTransfer>>
```

### Payment Codes

```ts
client.createPaymentCode(
  paymentName: string,
  amount: number,
  financialAccount: string,
  username: string,
  phoneNumber: string
): Promise<Result<CreatePaymentCode>>

client.deletePaymentCode(paymentCodeId: string): Promise<Result<DeletePaymentCode>>
```

### Payouts

```ts
client.createPayout(
  amount: number,
  phoneNumber: string,
  sourceAccount: string
): Promise<Result<CreatePayout>>
```

> Provider is inferred automatically from the phone number prefix.

---

## Examples

### Create a financial account

```ts
const account = await client.createFinancialAccount('App Wallet')
if (!account.success) throw account.error
console.log(account.data)
```

### Get account details

```ts
const details = await client.getFinancialAccount(account.data!.result.id)
console.log(details)
```

### Internal transfer

```ts
const transfer = await client.createInternalTransfer('acc-src', 'acc-dest', 5000)
if (!transfer.success) console.error(transfer.error)
else console.log(transfer.data)
```

### Create payment code

```ts
const code = await client.createPaymentCode('Order-001', 5, 'financial-account-id', 'Alice', '0771234567')
if (!code.success) console.error(code.error)
else console.log('Payment code:', code.data)
```

### Delete payment code

```ts
const deleted = await client.deletePaymentCode('payment-code-id')
console.log(deleted.success)
```

### Payout (mobile money)

```ts
const payout = await client.createPayout(1000, '0771234567', 'source-account-id')
if (!payout.success) console.error(payout.error)
else console.log('Payout:', payout.data)
```

---

## Migration from Old Helpers

Previously, you had to pass `monimeSpaceId` and `accessToken` into every function:

```ts
createFinancialAccount('name', MONIME_SPACE_ID, MONIME_ACCESS_TOKEN)
```

Now, create a client once:

```ts
const client = createClient({ monimeSpaceeId, accessToken })
client.createFinancialAccount('name') // credentials auto-applied
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
│   ├── index.ts               # entry point
│   └── modules
│       ├── financialAccount.ts
│       ├── financialAccountTypes.ts
│       ├── internalTransfer.ts
│       ├── internalTransferTypes.ts
│       ├── paymentCode.ts
│       ├── paymentCodeTypes.ts
│       ├── payout.ts
│       └── payoutTypes.ts
```

---

## Error Handling

* Network/API errors are returned as `error` in the `{ success, data?, error? }` object.
* Use `axios.isAxiosError(error)` to inspect response details if needed.

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

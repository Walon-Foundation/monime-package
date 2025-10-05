
# monime-package

![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-%3E=14-green.svg)

A focused TypeScript helper library for interacting with Monime's common endpoints. It provides small, typed helpers that handle request composition, headers, and basic response/error plumbing so your application code stays clean.

Package name: `monime-package`

## Table of contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API reference](#api-reference)
- [Examples](#examples)
- [Folder structure](#folder-structure)
- [Configuration & env](#configuration--env)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Description

monime-package wraps a subset of Monime endpoints into a tiny, typed client suitable for server-side Node.js use. It's intentionally small — the package focuses on convenience functions you can call directly from services, lambdas, or scripts.

## Features

- Lightweight wrapper around Monime endpoints
- TypeScript-first: exported types for request/response shapes
- Predictable return shape: { success: boolean, data?, error? }
- Small dependency surface (axios)

## Installation

Install with npm or pnpm:

```bash
npm install monime-package
```

or

```bash
pnpm add monime-package
```

## Quick start

1. Add your credentials to environment variables (recommended) or pass them directly to the functions.
2. Import the helpers and call them.

Example (TypeScript):

```ts
import {
  createFinancialAccount,
  createPaymentCode,
  createInternalTransfer,
  getFinancialAccount,
  deletePaymentCode,
  CreatePayoutMobileMoney,
} from 'monime-package'

async function demo() {
  const MONIME_SPACE_ID = process.env.MONIME_SPACE_ID!
  const MONIME_ACCESS_TOKEN = process.env.MONIME_ACCESS_TOKEN!

  // Create a financial account
  const createRes = await createFinancialAccount('My App Account', MONIME_SPACE_ID, MONIME_ACCESS_TOKEN)
  if (!createRes.success) throw createRes.error

  const accountId = createRes.data?.result?.id
  console.log('Created account id', accountId)
}

demo().catch(err => console.error(err))
```

## API reference

All functions return a Promise resolving to an object with the following minimal shape:

```ts
type Result<T> = {
  success: boolean
  data?: T
  error?: any
}
```

Top-level exports (signatures simplified):

- createFinancialAccount(accountName: string, monime_space_id: string, monime_access_token: string): Promise<Result<CreateFinancialAccount>>
- getFinancialAccount(financialAccountId: string, monime_access_token: string, monime_space_id: string): Promise<Result<GetFinancialAccount>>
- createInternalTransfer(sourceAccount: string, destinationAccount: string, monime_access_token: string, monime_space_id: string, value: number): Promise<Result<CreateInternalTransfer>>
- createPaymentCode(paymentName: string, amount: number, financialAccountId: string | null, name: string, phoneNumber: string, monime_access_token: string, monime_space_id: string): Promise<Result<{ code?: string }>>
- deletePaymentCode(paymentCodeId: string, monime_access_token: string, monime_space_id: string): Promise<Result<null>>
- CreatePayoutMobileMoney(amount: number, phoneNumber: string, sourceAccount: string, monime_access_token: string, monime_space_id: string): Promise<Result<CreatePayout>>

Refer to `src/functions/*Types.ts` for full TypeScript interfaces.

### Important behaviors

- createPaymentCode: input `amount` is multiplied by 100 before being sent (to match Monime's expected minor currency units).
- createPaymentCode: passing `financialAccountId` as an empty string results in `financialAccountId` being omitted from the request body.
- CreatePayoutMobileMoney: provider is inferred from phone number prefixes; check `src/functions/payout.ts` for the exact rules.
- Error responses: network/API errors may come back as axios error objects or the remote response body — handle both.

## Examples

Create a payment code and handle errors gracefully:

```ts
import { createPaymentCode } from 'monime-package'

async function createCode() {
  const res = await createPaymentCode('Order-001', 5, 'financial-account-id', 'Alice', '0771234567', process.env.MONIME_ACCESS_TOKEN!, process.env.MONIME_SPACE_ID!)
  if (!res.success) {
    console.error('Failed to create payment code', res.error)
    return
  }
  console.log('USSD code:', res.code)
}
```

Create an internal transfer:

```ts
import { createInternalTransfer } from 'monime-package'

const t = await createInternalTransfer('acc-src', 'acc-dest', process.env.MONIME_ACCESS_TOKEN!, process.env.MONIME_SPACE_ID!, 1500)
if (!t.success) console.error('transfer error', t.error)
else console.log('transfer result', t.data)
```

Payout (note: set `src/functions/payout.ts` URL before use):

```ts
import { CreatePayoutMobileMoney } from 'monime-package'

const p = await CreatePayoutMobileMoney(1000, '0771234567', 'source-account-id', process.env.MONIME_ACCESS_TOKEN!, process.env.MONIME_SPACE_ID!)
if (!p.success) console.error(p.error)
else console.log('payout', p.data)
```

## Folder structure

```
. 
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src
│   ├── index.ts                # re-exports
│   └── functions
│       ├── financialAccount.ts
│       ├── financialAccountTypes.ts
│       ├── internalTransfer.ts
│       ├── internalTransferTypes.ts
│       ├── paymentCode.ts
│       ├── paymentCodeTypes.ts
│       ├── payout.ts
│       └── payoutTypes.ts
```

## Configuration & env

Recommended environment variables (you can store them in `.env` during development):

```
MONIME_SPACE_ID=space_XXXXXXXX
MONIME_ACCESS_TOKEN=sk_live_xxx
```

## Troubleshooting

- Empty or invalid credentials: most functions will log or return an error if `monime_space_id` or `monime_access_token` are missing. Always validate env vars before calling the helpers.
- Network errors: axios errors are returned directly in some functions. Use `axios.isAxiosError` to inspect `error.response` and `error.response.data`.
- Payouts: if payout calls fail unexpectedly, check `src/functions/payout.ts` — its `URL` constant is empty and must be configured.

## Contributing

Contributions appreciated. Suggested small first PRs:

- Add an `examples/` folder with a safe demo script that reads env vars and shows each helper.
- Add tests using `vitest` or `jest` with `nock` or axios mocking.
- Normalize returned errors to a consistent shape.

When opening a PR, include a short description and tests for new behavior.

## License

MIT — see `LICENSE`.

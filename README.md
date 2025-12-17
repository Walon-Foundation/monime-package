
# monime-package

Official, lightweight TypeScript SDK for Monime. It provides a typed client for common Monime endpoints with consistent results and simple ergonomics.

![npm version](https://img.shields.io/npm/v/monime-package.svg)
![npm downloads](https://img.shields.io/npm/dm/monime-package.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-%3E=14-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

Package: `monime-package`

---

## Table of Contents

- **[Features](#features)**
- **[Installation](#installation)**
- **[Environment Variables](#environment-variables)**
- **[Quick Start](#quick-start)**
- **[API Reference](#api-reference)**
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
- **Predictable** return shape: `{ success, data?, error? }`
- **Client-based** auth: set credentials once per instance
- **Minimal deps** (`axios`) and small surface area
- **Full API coverage** for all Monime endpoints
- **Mobile Money support** (Africell, Orange, etc.)
- **Bank transfers** and digital wallet integrations
- **Checkout sessions** for hosted payment pages

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
MONIME_VERSION=caph.2025-08-23 # Optional, defaults to latest
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
  monimeVersion: "caph.2025-08-23", // Optional
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

## API Reference

All methods return the same envelope:

```ts
type Result<T> = {
  success: boolean;
  data?: T;
  error?: Error;
};
```

The client exposes namespaced APIs under `client.<module>`. Below is the complete API reference:

### Payments (New)

Manage all incoming payments (payins).

```ts
// Get payment details
client.payment.get(paymentId: string): Promise<Result<GetPayment>>

// List payments
client.payment.getAll(params?: any): Promise<Result<ListPayments>>

// Patch payment
client.payment.patch(paymentId: string, body: any): Promise<Result<PatchPayment>>
```

### Webhooks (New)

Manage webhooks for real-time notifications.

```ts
// Create webhook
client.webhook.create(body: CreateWebhookRequest): Promise<Result<CreateWebhookResponse>>

// Get webhook
client.webhook.get(webhookId: string): Promise<Result<GetWebhookResponse>>

// List webhooks
client.webhook.getAll(): Promise<Result<ListWebhooksResponse>>

// Update webhook
client.webhook.update(webhookId: string, body: UpdateWebhookRequest): Promise<Result<UpdateWebhookResponse>>

// Delete webhook
client.webhook.delete(webhookId: string): Promise<{ success: boolean; error?: Error }>
```

### Receipts (New)

Manage payment receipts.

```ts
// Get receipt
client.receipt.get(orderNumber: string): Promise<Result<GetReceiptResponse>>

// Redeem receipt
client.receipt.redeem(orderNumber: string, body: any): Promise<Result<RedeemReceiptResponse>>
```

### USSD OTPs (New)

Generate USSD OTPs.

```ts
// Create USSD OTP
client.ussdOtp.create(body: CreateUssdOtpRequest): Promise<Result<CreateUssdOtpResponse>>
```

### Provider KYC (New)

Get provider KYC details.

```ts
// Get provider KYC
client.providerKyc.get(providerId: string): Promise<Result<GetProviderKycResponse>>
```

### Financial Accounts

Manage digital wallets and financial accounts.

```ts
// Create a new financial account
client.financialAccount.create(name: string): Promise<Result<CreateFinancialAccount>>

// Get account details by ID
client.financialAccount.get(financialAccountId: string): Promise<Result<GetFinancialAccount>>

// List all financial accounts
client.financialAccount.getAll(): Promise<Result<AllFinancialAccount>>
```

**Parameters:**
- `name`: Account name (required)
- `financialAccountId`: Unique account identifier (required)

**Example:**
```ts
// Create account
const account = await client.financialAccount.create("My Wallet");
if (account.success) {
  console.log("Account ID:", account.data.result.id);
  console.log("Balance:", account.data.result.balance.available.value);
}

// Get account details
const details = await client.financialAccount.get("fa-123456");
```

### Internal Transfers

Transfer funds between your financial accounts.

```ts
// Create internal transfer
client.internalTransfer.create(
  sourceAccount: string,
  destinationAccount: string,
  amount: number,
): Promise<Result<CreateInternalTransfer>>

// Get transfer details
client.internalTransfer.get(internalTransferId: string): Promise<Result<InternalTransfer>>

// List all transfers
client.internalTransfer.getAll(): Promise<Result<AllInternalTransfers>>

// Cancel/delete a transfer
client.internalTransfer.delete(internalTransferId: string): Promise<{ success: boolean; error?: Error }>
```

**Parameters:**
- `sourceAccount`: Source financial account ID (required)
- `destinationAccount`: Destination financial account ID (required)
- `amount`: Transfer amount in SLE (required, must be > 0)
- `internalTransferId`: Transfer ID for get/delete operations (required)

**Example:**
```ts
// Transfer 1000 SLE between accounts
const transfer = await client.internalTransfer.create("fa-source", "fa-dest", 1000);
if (transfer.success) {
  console.log("Transfer ID:", transfer.data.result.id);
  console.log("Status:", transfer.data.result.status);
}
```

### Payment Codes

Generate USSD payment codes for mobile money transactions.

```ts
// Create payment code
client.paymentCode.create(
  paymentName: string,
  amount: number,
  financialAccount: string,
  username: string,
  phoneNumber: string,
): Promise<Result<CreatePaymentCode>>

// Get payment code details
client.paymentCode.get(paymentCodeId: string): Promise<Result<GetOne>>

// List all payment codes
client.paymentCode.getAll(): Promise<Result<GetAllPaymentCode>>

// Delete payment code
client.paymentCode.delete(paymentCodeId: string): Promise<{ success: boolean; error?: Error }>
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
const paymentCode = await client.paymentCode.create(
  "Order #12345",
  5000, // 50.00 SLE
  "fa-123456",
  "John Doe",
  "0771234567"
);

if (paymentCode.success) {
  console.log("USSD Code:", paymentCode.data.result.ussdCode);
  console.log("Expires at:", paymentCode.data.result.expireTime);
}
```

### Payouts

Send money to mobile money providers, banks, or wallets.

```ts
// Create payout
client.payout.create(
  amount: number,
  destination: DestinationOption,
  sourceAccount: string,
): Promise<Result<CreatePayout>>

// List all payouts
client.payout.get(): Promise<Result<GetAll>>

// Get specific payout
client.payout.getOne(payoutId: string): Promise<Result<GetOnePayout>>

// Cancel payout
client.payout.delete(payoutId: string): Promise<{ success: boolean; error?: Error }>
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
const mobileMoneyPayout = await client.payout.create(
  10000, // 100.00 SLE
  { type: "momo", providerId: "m17", phoneNumber: "0771234567" },
  "fa-123456"
);

// Bank transfer payout
const bankPayout = await client.payout.create(
  50000, // 500.00 SLE
  { type: "bank", providerId: "b01", accountNumber: "1234567890" },
  "fa-123456"
);
```

### Financial Transactions

Query transaction history and details.

```ts
// Get transaction details
client.financialTransaction.get(transactionId: string): Promise<Result<GetTransaction>>

// List all transactions
client.financialTransaction.getAll(): Promise<Result<AllTransaction>>
```

**Parameters:**
- `transactionId`: Transaction ID (required)

**Example:**
```ts
// Get all transactions
const transactions = await client.financialTransaction.getAll();
if (transactions.success) {
  transactions.data.result.forEach(tx => {
    console.log(`${tx.type}: ${tx.amount.value} ${tx.amount.currency}`);
  });
}
```

### Checkout Sessions

Create hosted payment pages for seamless customer payments.

```ts
// Create checkout session
client.checkoutSession.create(
  name: string,
  amount: number,
  quantity: number,
  successUrl: string,
  cancelUrl: string,
  description?: string,
  financialAccountId?: string,
  primaryColor?: string,
  images?: string[],
): Promise<Result<CreateCheckout>>

// List all checkout sessions
client.checkoutSession.get(): Promise<Result<AllCheckout>>

// Get specific checkout session
client.checkoutSession.getOne(checkoutId: string): Promise<Result<OneCheckout>>

// Delete checkout session
client.checkoutSession.delete(checkoutId: string): Promise<{ success: boolean; error?: Error }>
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
const checkout = await client.checkoutSession.create(
  "Premium Subscription",
  2500, // 25.00 SLE per month
  1,
  "https://myapp.com/success",
  "https://myapp.com/cancel",
  "Monthly premium subscription",
  "fa-123456",
  "#3B82F6", // Blue color
  ["https://myapp.com/images/premium.jpg"]
);

if (checkout.success) {
  // Redirect customer to checkout page
  console.log("Checkout URL:", checkout.data.result.redirectUrl);
  console.log("Order Number:", checkout.data.result.orderNumber);
}
```

---

## Configuration

The client accepts the following options (see `src/client.ts`):

```ts
type ClientOptions = {
  monimeSpaceId: string; // Your Monime Space ID
  accessToken: string;   // Your Monime API token
  monimeVersion?: "caph.2025-08-23" | "caph.2025-06-20"; // API Version
};
```

- **Authentication**: Both values are required. Prefer environment variables.
- **Headers**: SDK automatically sets `Authorization` and `Monime-Space-Id` for each call.

---

## Complete Examples

Here are comprehensive examples showing real-world usage patterns:

### Complete E-commerce Integration

```ts
import { createClient, type DestinationOption } from "monime-package";

// Initialize client
const client = createClient({
  monimeSpaceId: process.env.MONIME_SPACE_ID!,
  accessToken: process.env.MONIME_ACCESS_TOKEN!,
});

// Create business account
const businessAccount = await client.financialAccount.create("E-commerce Store");
if (!businessAccount.success) {
  throw new Error(`Failed to create account: ${businessAccount.error?.message}`);
}

const accountId = businessAccount.data!.result.id;
console.log(`Created account: ${accountId}`);
console.log(`Balance: ${businessAccount.data!.result.balance.available.value} SLE`);

// Create checkout session for customer
const checkout = await client.checkoutSession.create(
  "Digital Camera",
  45000, // 450.00 SLE
  1,
  "https://store.com/success",
  "https://store.com/cancel",
  "Professional DSLR Camera with lens kit",
  accountId,
  "#2563EB", // Brand blue
  ["https://store.com/camera.jpg"]
);

if (checkout.success) {
  console.log(`Checkout created: ${checkout.data!.result.id}`);
  console.log(`Payment URL: ${checkout.data!.result.redirectUrl}`);
  console.log(`Order: ${checkout.data!.result.orderNumber}`);
}
```

### Payment Processing Workflow

```ts
// 1. Generate USSD payment code for customer
const paymentCode = await client.paymentCode.create(
  "Invoice #INV-2024-001",
  15000, // 150.00 SLE
  accountId,
  "Customer Name",
  "0771234567"
);

if (paymentCode.success) {
  console.log(`USSD Code: ${paymentCode.data!.result.ussdCode}`);
  console.log(`Expires: ${paymentCode.data!.result.expireTime}`);
  
  // Send USSD code to customer via SMS/email
  await sendToCustomer(paymentCode.data!.result.ussdCode);
}

// 2. Monitor payment status
const checkPaymentStatus = async (codeId: string) => {
  const status = await client.paymentCode.get(codeId);
  if (status.success) {
    console.log(`Payment Status: ${status.data!.result.status}`);
    return status.data!.result.status === 'completed';
  }
  return false;
};

// 3. Process payout to supplier after payment received
const paySupplier = async () => {
  const payout = await client.payout.create(
    8000, // 80.00 SLE to supplier
    {
      type: "momo",
      providerId: "m17",
      phoneNumber: "0779876543"
    },
    accountId
  );
  
  if (payout.success) {
    console.log(`Payout ID: ${payout.data!.result.id}`);
    console.log(`Status: ${payout.data!.result.status}`);
    console.log(`Fees: ${payout.data!.result.fees.map(f => `${f.code}: ${f.amount.value}`)}`);
  }
};
```

### Multi-Account Management

```ts
// Create multiple accounts for different purposes
const accounts = await Promise.all([
  client.financialAccount.create("Sales Revenue"),
  client.financialAccount.create("Operating Expenses"),
  client.financialAccount.create("Tax Reserve"),
]);

// Check if all accounts were created successfully
if (accounts.every(acc => acc.success)) {
  const [salesAccount, expensesAccount, taxAccount] = accounts.map(acc => acc.data!.result.id);
  
  // Distribute revenue: 70% operations, 30% tax reserve
  const revenue = 100000; // 1000.00 SLE
  
  const transfers = await Promise.all([
    client.internalTransfer.create(salesAccount, expensesAccount, revenue * 0.7),
    client.internalTransfer.create(salesAccount, taxAccount, revenue * 0.3),
  ]);
  
  transfers.forEach((transfer, index) => {
    const purpose = index === 0 ? 'operations' : 'tax reserve';
    if (transfer.success) {
      console.log(`${purpose} transfer: ${transfer.data!.result.id}`);
    }
  });
}
```

### Transaction Monitoring & Reporting

```ts
// Get all transactions for reporting
const transactions = await client.financialTransaction.getAll();

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
    const account = await client.financialAccount.get(accountId);
    if (account.success) {
      console.log(`Account ${accountId}: ${account.data!.result.balance.available.value} SLE`);
    }
  }
}
```

### Error Handling Best Practices

```ts
// Robust error handling with retries
const createTransferWithRetry = async (
  sourceAccount: string,
  destinationAccount: string,
  amount: number,
  maxRetries = 3
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const transfer = await client.internalTransfer.create(sourceAccount, destinationAccount, amount);
    
    if (transfer.success) {
      return transfer;
    }
    
    // Log the error
    console.error(`Transfer attempt ${attempt} failed:`, transfer.error?.message);
    
    // Don't retry on validation errors
    if (transfer.error?.message?.includes('validation')) {
      throw transfer.error;
    }
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error(`Transfer failed after ${maxRetries} attempts`);
};

// Usage
try {
  const transfer = await createTransferWithRetry("fa-source", "fa-dest", 10000);
  console.log("Transfer successful:", transfer.data!.result.id);
} catch (error) {
  console.error("Transfer failed permanently:", error.message);
}
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

## TypeScript Types

All result payload types are exported from the package for complete type safety:

```ts
import type {
  // Core types
  ClientOptions,
  
  // Financial Account types
  CreateFinancialAccount,
  GetFinancialAccount,
  AllFinancialAccount,

  // Internal Transfer types
  CreateInternalTransfer,
  InternalTransfer,
  AllInternalTransfers,

  // Payment Code types
  CreatePaymentCode,
  GetAllPaymentCode,
  GetOne,

  // Payout types
  DestinationOption,
  CreatePayout,
  GetAll,
  GetOnePayout,

  // Financial Transaction types
  GetTransaction,
  AllTransaction,
  
  // Checkout Session types
  CreateCheckout,
  AllCheckout,
  OneCheckout,
} from "monime-package";
```

### Core Type Definitions

#### Result Envelope
All API responses follow this consistent pattern:
```ts
type Result<T> = {
  success: boolean;
  data?: T;
  error?: Error;
};
```

#### Client Configuration
```ts
type ClientOptions = {
  monimeSpaceId: string; // Your Monime Space ID
  accessToken: string;   // Your API access token
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
  success: boolean;
  messages: string[];
  result: {
    id: string;           // Unique account ID
    uvan: string;         // Internal identifier
    name: string;         // Account name
    currency: string;     // Always "SLE" (Sierra Leone)
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
  };
}
```

#### Internal Transfer Types
```ts
interface CreateInternalTransfer {
  success: boolean;
  messages: string[];
  result: {
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
  };
}
```

#### Payment Code Types
```ts
interface CreatePaymentCode {
  success: boolean;
  messages: string[];
  result: {
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
  };
}
```

#### Checkout Session Types
```ts
interface CreateCheckout {
  success: boolean;
  messages: string[];
  result: {
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
  };
}
```

#### Common Types
```ts
// Pagination for list responses
interface Pagination {
  count: number;  // Total count
  next: string;   // Next page URL/cursor
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
const createAccountTyped = async (name: string): Promise<CreateFinancialAccount | null> => {
  const result = await client.financialAccount.create(name);
  return result.success ? result.data! : null;
};

// Type-safe payout with validation
const createMobileMoneyPayout = async (
  amount: number,
  phoneNumber: string,
  sourceAccount: string
): Promise<CreatePayout | null> => {
  const destination: DestinationOption = {
    type: "momo",
    providerId: "m17",
    phoneNumber,
  };
  
  const result = await client.payout.create(amount, destination, sourceAccount);
  return result.success ? result.data! : null;
};

// Type-safe transaction processing
const processTransactions = async (): Promise<void> => {
  const txResult = await client.financialTransaction.getAll();
  
  if (txResult.success && txResult.data) {
    const transactions: AllTransaction = txResult.data;
    
    transactions.result.forEach((tx: GetTransaction['result']) => {
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
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding conventions
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## License

MIT — see [LICENSE](./LICENSE).

---

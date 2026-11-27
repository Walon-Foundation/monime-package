# Changelog

All notable changes to `monime-package` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.2.0] - 2026-11-27

Brings the SDK in line with the Monime API spec for release `caph.2025-08-23`
(`https://docs.monime.io/apis/openapi.json`).

> **This minor release breaks the 1.1.x API** in the places marked
> **BREAKING** below. Semantic versioning would call it 2.0.0. A range such as
> `^1.1.9` will install it automatically, so pin `~1.1.9` (or `1.1.9`) until
> your code follows the migration notes.

### Added

- `idempotencyKeyFor(reference)` derives a stable idempotency key (a UUIDv5)
  from your own record, so a retry, even from another process, sends the same
  key. The Go SDK derives the same key from the same reference.
- `verifyWebhookSignature()` and `parseWebhookEvent()` verify the
  `Monime-Signature` header on webhook deliveries. Both HS256 (shared secret)
  and ES256 (P-256 public key) are supported, with Monime's 300 s / 60 s
  freshness window and several `v1` values for key rotation. Failures return
  a `MonimeWebhookSignatureError` with a `reason`.
- `WEBHOOK_EVENTS`, the event names on the `caph` release, and the
  `WebhookEvent` envelope type.
- A `currency` (`SLE` or `USD`) on payouts and internal transfers, and on
  payment code, checkout and recurrent-target amounts.
- Financial accounts: `reference` on create; `retrieve(id, { withBalance })`;
  `list()` filters `uvan`, `reference` and `withBalance`.
- List filters as the API defines them:
  - payouts: `status`, `sourceFinancialAccountId`, `sourceTransactionReference`
    and `destinationTransactionReference`;
  - internal transfers: `status`, the source and destination accounts and
    `financialTransactionReference`;
  - payment codes: `ussdCode` (sent as `ussd_code`), `mode` and `status`;
  - payments: `orderNumber`, `financialAccountId` and
    `financialTransactionReference`;
  - financial transactions: `financialAccountId`, `reference` and `type`.
- USSD OTPs accept `verificationMessage`, `duration` and `metadata`.
- Exported constants: `BANK_PROVIDER_IDS`, `MOMO_PROVIDER_IDS`,
  `WALLET_PROVIDER_IDS`, `PAYOUT_STATUSES`, `PAYOUT_FAILURE_CODES`,
  `PAYMENT_CODE_STATUSES`, `INTERNAL_TRANSFER_STATUSES` and
  `DEFAULT_MONIME_VERSION`.
- Shared types: `Amount`, `AmountInput`, `Currency`, `Metadata`,
  `MetadataInput`, `OwnershipGraph`, `Fee`, and one named type per resource
  (`Payout`, `PaymentCode`, `CheckoutSession`, …).

### Changed

- **BREAKING:** `paymentCode.create()` takes the API's own fields.
  - **Amount:** `amount` is `{ currency?, value }` in **minor units** and is
    no longer multiplied by 100.
  - **Defaults:** the code is `one_time` with a 10 minute life, as in the
    API, instead of a forced `recurrent`, `1h30m` code.
  - **Migration:**

    ```ts
    // before (1.x)
    { paymentName: "Order", amount: 50, name: "John", phoneNumber: "077…", financialAccountId }

    // after
    { name: "Order", amount: { value: 5000 }, customer: { name: "John" },
      authorizedPhoneNumber: "+23277…", financialAccountId }
    ```

    A bare number for `amount` is refused, never sent. `paymentCode.update()`
    is typed to the fields the API accepts.
- **BREAKING:** `checkoutSession.create()` takes `lineItems` (1 to 16, each
  `{ name, price: { currency?, value }, quantity?, … }`) instead of a single
  `amount` and `quantity`.
  - **Moved fields:** `primaryColor` moves to
    `brandingOptions.primaryColor`; `paymentOptions`, `reference`,
    `callbackState` and `metadata` are passed through.
  - **Optional URLs:** `successUrl` and `cancelUrl` are now optional.
  - **Migration:** `{ name, amount: 2500, quantity: 1, … }` becomes
    `{ name, lineItems: [{ name, price: { value: 2500 }, quantity: 1 }], … }`.
- **BREAKING:** `providerKyc.retrieve(providerId, accountId)` takes the account
  to look up, which the API requires. The response is typed as
  `{ account: { holderName, … }, provider }`.
- **BREAKING:** `receipt.redeem()` resolves to `{ redeem, receipt }`, the
  shape the API returns. The body is typed (`redeemAll`, `entitlements`,
  `metadata`).
- **BREAKING:** `financialProvider.bank.list(country, options?)` and
  `financialProvider.momo.list(country, options?)` take the country (e.g.
  `"SL"`), which the API requires.
- **BREAKING (types):** `List*Response` types are arrays (e.g.
  `ListPayoutsResponse` is `Payout[]`), which is what `data` holds on a list
  call; the cursor is on `result.pagination`. The old `{ result, pagination }`
  types never matched what was returned.
- **BREAKING (types):** every `update()` takes the fields the API accepts for
  that resource instead of `Record<string, unknown>`. Unknown fields are
  refused before the request.
- `Monime-Version: caph.2025-08-23` is sent when no version is configured.
- `payout.create()` makes `sourceAccount` optional: Monime then pays from the
  Space's main account.
- Webhook `create()` defaults `apiRelease` to `caph`, and `update()` can
  change it.
- Response types follow the spec's nullable fields. For example, `balance` is
  null unless requested, and `fees` is null until a payout is processed.
- Validation failures are `MonimeValidationError`s with one readable message
  per field.

### Fixed

- **Payout providers:** payouts accept the real bank and wallet provider IDs
  (`slb001`, `slb004`, `slb007`, `dw001`). The validator only allowed
  `b01`–`b03` and `w01`–`w02`, which don't exist, so no bank or wallet payout
  could be sent.
- **Idempotency keys:** a caller-supplied key that is empty or longer than 64
  characters is refused before sending. An empty key used to be silently
  replaced with a random one.
- **Unset fields:** request bodies leave out what isn't set. They no longer
  send `description: ""`, `metadata: {}`, `reference: null` or
  `financialAccountId: ""`, which several endpoints reject.
- **Description limits:** internal transfer descriptions are checked against
  the API limits (150 characters on create, 255 on update).
- **Webhook management:**
  - ES256 webhooks are created without a secret and return their PEM public
    key;
  - HS256 secrets must be 32 to 256 characters;
  - `update()` no longer sends `verificationMethod`, which the API doesn't
    accept on update.
- **Metadata:** checked against the API rules (64 pairs, keys of 1-64
  characters from `[a-zA-Z0-9_-]` that don't begin with `_`, `-` or `monime`,
  and string values of at most 100 characters).
- **Payment status:** the type no longer includes `failed`, which the API
  doesn't have.
- **ID checks:** empty IDs on `retrieve()` and `delete()` calls are refused
  before any request.

## [1.1.9] - 2026-09-06

### Added

- A `reason` on every `MonimeError`, plus typed subclasses:
  `MonimeAuthenticationError`, `MonimeConflictError` and `MonimeRateLimitError`
  (with `retryAfter` and `limit`).
- Cursor pagination (`{ limit, after }`) on every `list()`, with the cursor on
  `result.pagination`.
- A caller-supplied idempotency key (`{ idempotencyKey }`) on every create and
  update.

### Fixed

- Errors are read from the API's real error envelope, and the request id
  from `Monime-Request-Id`.

## [1.1.8] - 2026-07-01

### Added

- `update()` (PATCH) for payment codes, financial accounts, payouts and
  internal transfers.
- `retrieve()`, `list()` and `delete()` for USSD OTPs.
- Runnable examples in `examples/`.

### Fixed

- USSD OTP create sends `authorizedPhoneNumber`.

### Changed

- The README marks the SDK as unofficial and documents every method against
  `caph.2025-08-23`.

## [1.1.6] - 2026-02-01

### Changed

- README and client configuration error messages. (1.1.5 shipped the first
  half of the same change.)

## [1.1.4] - 2026-02-01

### Changed

- HTTP is done with the platform `fetch`; axios is removed.
- Resources, types and validators are split into `src/resources`,
  `src/types` and `src/validators`.

### Added

- `MonimeError` with the request id, and end-to-end tests for every resource.

## [1.1.3] - 2026-01-29

### Added

- zod input validation, and the `Result<T>` return type on every method.
- Bank and mobile money provider lookups under `client.financialProvider`.

## [1.1.2] - 2025-12-17

### Added

- A standard pagination type, and types for checkout sessions and financial
  transactions.

## [1.1.1] - 2025-12-17

### Changed

- Responses are unwrapped from the API's `result` envelope.

## [1.1.0] - 2025-12-17

### Changed

- Client configuration is held by the client instead of fetched per call.

## [1.0.9] - 2025-12-17

### Added

- Payments, webhooks, receipts, USSD OTPs and provider KYC.
- The `Monime-Version` header, configurable on the client.

### Changed

- The build is minified and ships without source maps.

## [1.0.8] - 2025-10-15

### Fixed

- Checkout session creation.

## [1.0.7] - 2025-10-15

### Fixed

- Checkout session creation, and the currency type on financial account
  creation.

## [1.0.6] - 2025-10-14

### Added

- Checkout sessions: create, retrieve, list and delete.

## [1.0.5] - 2025-10-12

### Added

- Listing financial accounts.
- Retrieving and deleting internal transfers.
- Financial transactions.
- Retrieving and listing payment codes.
- Retrieving, listing and deleting payouts.
- Biome lint and format in CI.

### Changed

- `spaceeId` is renamed to `spaceId`.

## [1.0.4] - 2025-10-06

### Changed

- Inputs are checked before a request, and type errors are fixed.

## [1.0.2] - 2025-10-06

### Added

- `MonimeClient`, with financial accounts, internal transfers, payment codes
  and payouts as namespaced modules, and a contributing guide.

## [1.0.0] - 2025-10-05

### Changed

- The README documents the package.

## [0.0.1] - 2025-10-05

### Added

- First release: payment codes, financial accounts, internal transfers and
  mobile money payouts.

[Unreleased]: https://github.com/Walon-Foundation/monime-package/compare/main...HEAD

# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`monime-package` — an unofficial, community-maintained TypeScript SDK for the
Monime payments API (Sierra Leone). Published to npm; consumed as a library, so
the public surface in `src/index.ts` is the product. Runtime deps: `zod` only
(HTTP uses the platform `fetch`).

## Commands

```bash
pnpm install
pnpm test            # vitest — note: watch mode. Use `pnpm vitest run` for one-shot.
pnpm build           # tsup — dual CJS/ESM + .d.ts into dist/
pnpm lint-format     # biome check --write --unsafe (formats AND lints; auto-fixes)
pnpm vitest run test/unit/validators/payout.validator.test.ts   # single file
```

CI (`.github/workflows/biome.yml`) runs `biome ci .` on every push/PR — it is
the only automated gate, so run `pnpm lint-format` before committing. There is
no typecheck script; `pnpm build` (or `npx tsc --noEmit`) is what surfaces type
errors.

Two gotchas with `pnpm lint-format`: `biome ci .` **already fails on `main`**
over `examples/` (`noNonNullAssertion`, `noUnsafeOptionalChaining`), and the
examples are 2-space indented while `biome.json` mandates tabs — so a bare
`lint-format` reformats all seven of them. Scope it (`biome check --write src
test`) unless you mean to fix `examples/` as its own change.

## Architecture

```
src/
├── index.ts        # public entry: createClient(), MonimeClient, types, errors
├── client.ts       # MonimeClient — validates credentials, instantiates resources
├── http.ts         # HttpClient base class: baseUrl, headers, error mapping
├── error.ts        # MonimeError / MonimeAuthenticationError / MonimeValidationError
├── resources/      # one class per API resource, extends HttpClient
├── types/          # request/response interfaces, re-exported via types/index.ts
└── validators/     # zod input schemas (only for endpoints that take input)
```

Every API resource is a **trio**: the class in `src/resources/`, its types in
`src/types/`, and a zod validator in `src/validators/` when it accepts input.
Adding a resource means touching all three plus `src/types/index.ts`,
`src/client.ts`, and tests in both `test/e2e/` and `test/unit/validators/`.

Resources extend `HttpClient` rather than composing it, so `this.request<T>()`
is available directly and each class holds a `private readonly path = "/…"`.

## Conventions that matter

**Never throw from a resource method.** Every public method returns
`Result<T> = { success: boolean; data?: T; error?: Error | MonimeError }`.
`HttpClient.request` catches everything — network failures, non-2xx, JSON parse
errors — and returns `{ success: false, error }`. Validation failures return
the same shape: `{ success: false, error: new Error(validation.error.message) }`.
The one place that throws is the `MonimeClient` constructor, for missing
credentials (with a multi-line, actionable message — match that style).

**Response unwrapping** happens in `http.ts`: the API's
`{ success, messages, result, pagination }` envelope is unwrapped — `result`
becomes `data` (falling back to the whole body when absent) and `pagination`
is carried through to `result.pagination`. `204` returns `{ success: true }`
with no `data`. Resource types therefore describe the *unwrapped* payload.

**Error envelopes** are `{ success: false, messages: [], error: { code, reason,
message, details } }` — the message is nested under `error`, not top-level.
`parseErrorBody` handles that plus the flat-`message` and `messages[]` fallbacks.
Status codes map to subclasses in `toError`: 401 → `MonimeAuthenticationError`,
409 → `MonimeConflictError` (`idempotency_key_in_use`), 429 →
`MonimeRateLimitError` (carries `retryAfter` from `Retry-After` and `limit` from
`Monime-Rate-Limit`), anything else → `MonimeError`. The `reason` field is the
machine-readable cause — prefer it over string-matching messages.

**The request id header is `Monime-Request-Id`** (`x-request-id` is kept only as
a fallback).

**Idempotency keys** go through `HttpClient.idempotencyKey(requestOptions)`,
which prefers a caller-supplied key (`??`, so an explicit `""` is kept and then
refused) and otherwise mints `randomBytes(20).toString("hex")` from
`node:crypto`. (This means Node, not edge/browser, is the supported runtime.)
`request()` refuses a key that is empty or over 64 characters before sending.
Every mutating method takes a trailing `requestOptions?: MutationOptions` — a
generated key only covers a double-submit within one call, so retry-safety
requires the caller to pass a stable key; `idempotencyKeyFor(reference)` in
`src/idempotency.ts` derives one as a UUIDv5 (namespace
`324f9f23-0e7a-54ba-9149-8240b1833dc1`, shared with the Go SDK; the test
vectors in `test/unit/idempotency.test.ts` must match Go's). Read-only methods
omit the header. The API requires it on every POST and scopes it per Space.

**Monime-Version** is always sent: the configured version, or
`DEFAULT_MONIME_VERSION` (`caph.2025-08-23`).

**Pagination** is forward-cursor: every `list()` takes its options (`limit`
1-50, default 10; `after` an opaque cursor; plus the endpoint's filters) and
passes `query: this.listQuery(options, { ...filters })`. Undefined/empty query
values are dropped in `buildUrl`, so `list()` with no args sends no query
string. A list call's `data` is the page itself (the unwrapped `result` array),
so `List*Response` types are arrays; read the next cursor off
`result.pagination.next` — it is `null` on the final page. `bank.list` and
`momo.list` take the required `country` as their first argument.

**Money is in minor units everywhere**, never scaled by the SDK. Request amounts
are `AmountInput` (`{ currency?: "SLE" | "USD"; value }`, currency defaulting to
`SLE`) or, for payouts and transfers, `amount` plus an optional `currency`.
`amountInputSchema` refuses fractions and non-positive values.

**Request bodies send only what was set.** Many API schemas set
`additionalProperties: false`, so resources build bodies with `compact()` from
`validators/common.ts` and validators use `.strict()`. Metadata goes through
`metadataSchema` (create) or `metadataUpdateSchema` (update, where `null`
deletes a key). Validation failures return `this.invalid(zodError | message)`,
a `MonimeValidationError`.

**Webhook deliveries** are verified by `src/webhookSignature.ts`
(`verifyWebhookSignature`, `parseWebhookEvent`): `Monime-Signature:
t=<unix>,v1=<base64>` over `t + "_" + rawBody`, HS256 (HMAC-SHA256, base64) or
ES256 (P-256, DER signature), 300 s / 60 s freshness. They return `Result` and
never throw. The HS256 vector in `test/unit/webhookSignature.test.ts` is shared
with the Go SDK.

**Credentials** come from constructor options first, then `MONIME_SPACE_ID`,
`MONIME_ACCESS_TOKEN`, `MONIME_VERSION` env vars.

## Style

- Biome, not Prettier/ESLint: **tabs**, double quotes, organize-imports on.
  Don't hand-format — run `pnpm lint-format`.
- `noExplicitAny` is off, but prefer real types anyway.
- tsconfig is strict *plus* `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
  `noImplicitReturns`. Optional fields are assigned conditionally
  (`if (status !== undefined) this.status = status`) rather than passed as
  possibly-`undefined` — follow that pattern.
- JSDoc on every public method, with `@param` for ids.

## Tests

`vitest`, no config file (defaults). E2E tests stub global `fetch` with
`vi.stubGlobal("fetch", fetchMock)` and assert on the `Result` shape — they
never hit the network. Unit tests exercise zod schemas via `safeParse`.
Test names follow `should success: …` / `should fail: …`.

## Docs to keep in sync

`README.md` documents every method against a pinned API version
(`caph.2025-08-23`), `examples/` holds runnable scripts, and `CHANGELOG.md`
records each change (breaking ones with a migration line) under
`## [Unreleased]` until a release is cut. A change to the public API means
updating all three.

The authority for the API is the published OpenAPI spec,
`https://docs.monime.io/apis/openapi.json`, with the prose docs at
`https://docs.monime.io` (append `.md` to any page for Markdown). Check field
names, required fields, limits and `additionalProperties` there, not against
the rendered reference alone. The Go SDK (`monime-package-go`) mirrors this
one; behaviour that differs between them is a bug in one of them.

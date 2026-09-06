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
which prefers a caller-supplied key and otherwise mints
`randomBytes(20).toString("hex")` from `node:crypto`. (This means Node, not
edge/browser, is the supported runtime.) Every mutating method takes a trailing
`requestOptions?: MutationOptions` for this — a generated key only covers a
double-submit within one call, so retry-safety requires the caller to pass a
stable key. Read-only methods omit the header. The API caps it at 64 chars and
scopes it per Space.

**Pagination** is forward-cursor: every `list()` takes `options?: ListOptions`
(`limit` 1-50, default 10; `after` an opaque cursor) and passes
`query: this.listQuery(options)`. Undefined/empty query values are dropped in
`buildUrl`, so `list()` with no args sends no query string. Read the next cursor
off `result.pagination.next` — it is `null` on the final page.

**Money is in minor units.** Callers pass major units and resources multiply by
100 with currency `"SLE"` (see `paymentCode.ts`). Keep that boundary consistent.

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
(`caph.2025-08-23`), and `examples/` holds runnable scripts. A change to the
public API means updating both.

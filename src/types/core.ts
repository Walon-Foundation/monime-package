import type { MonimeError } from "../error";

export interface ClientConfig {
	monimeSpaceId: string;
	accessToken: string;
	monimeVersion?: string | undefined;
}

/** The API release sent in `Monime-Version` when none is configured. */
export const DEFAULT_MONIME_VERSION = "caph.2025-08-23";

/** Currencies the API accepts. Values are always in minor units (cents). */
export type Currency = "SLE" | "USD";

/** A monetary value as the API returns it, in minor units (e.g. cents). */
export interface Amount {
	currency: string;
	value: number;
}

/**
 * A monetary value sent to the API, in **minor units**: `{ value: 1050 }` is
 * SLE 10.50. `currency` defaults to `"SLE"`.
 */
export interface AmountInput {
	currency?: Currency;
	value: number;
}

/** Metadata as the API returns it: a flat map of strings. */
export type Metadata = Record<string, string>;

/**
 * Metadata sent to the API. At most 64 pairs; keys are 1-64 characters of
 * `[a-zA-Z0-9_-]` and cannot begin with `_`, `-` or `monime`; values are
 * strings of at most 100 characters. On update, `null` or `""` deletes a key.
 * @see https://docs.monime.io/docs/developer-resources/api-basics/object-metadata
 */
export type MetadataInput = Record<string, string | null>;

/** One node in an object's ownership graph. */
export interface OwnershipNode {
	id: string;
	type: string;
	metadata?: Metadata | null;
	owner?: OwnershipNode | null;
}

/** Traces which objects led to this one (e.g. payment code → payment). */
export interface OwnershipGraph {
	owner: OwnershipNode;
}

/** A fee applied to a payout or payment. */
export interface Fee {
	code: string;
	amount: Amount;
	metadata?: Metadata | null;
}

export interface Pagination {
	/** Number of items in the current page. */
	count: number;
	/** Cursor for the next page, or `null` once the last page is reached. */
	next: string | null;
}

/** Cursor pagination accepted by every `list()` method. */
export interface ListOptions {
	/**
	 * Maximum items per page. The API accepts 1-50 and defaults to 10.
	 */
	limit?: number;
	/**
	 * Cursor taken verbatim from a previous response's `pagination.next`.
	 * Cursors are opaque and query-specific — never build or edit one.
	 */
	after?: string;
}

/** Per-call options for endpoints that create or mutate a resource. */
export interface MutationOptions {
	/**
	 * Key identifying this logical operation, so retries are not processed
	 * twice. Reuse the *same* key when retrying a failed call — a fresh key on
	 * every attempt provides no protection. Generated automatically when
	 * omitted, which only covers accidental double-submits within one call.
	 * 1-64 characters, scoped to your Space. `idempotencyKeyFor(reference)`
	 * derives a stable key from your own record.
	 */
	idempotencyKey?: string;
}

export interface Result<T> {
	data?: T;
	success: boolean;
	error?: Error | MonimeError;
	/** Present on list endpoints; carries the cursor for the next page. */
	pagination?: Pagination;
}

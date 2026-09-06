import type { MonimeError } from "../error";

export interface ClientConfig {
	monimeSpaceId: string;
	accessToken: string;
	monimeVersion?: string | undefined;
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
	 * Max 64 characters, scoped to your Space.
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

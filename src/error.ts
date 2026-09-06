export class MonimeError extends Error {
	public readonly status?: number;
	public readonly requestId?: string;
	/**
	 * Machine-readable cause from the API error envelope, e.g.
	 * `too_many_requests` or `idempotency_key_in_use`.
	 */
	public readonly reason?: string;
	public readonly details?: unknown;

	constructor(
		message: string,
		status?: number,
		requestId?: string,
		details?: unknown,
		reason?: string,
	) {
		super(message);
		this.name = "MonimeError";
		if (status !== undefined) this.status = status;
		if (requestId !== undefined) this.requestId = requestId;
		if (reason !== undefined) this.reason = reason;
		this.details = details;

		// Maintain proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, MonimeError);
		}
	}
}

export interface MonimeErrorOptions {
	requestId?: string | undefined;
	details?: unknown;
	reason?: string | undefined;
}

export class MonimeAuthenticationError extends MonimeError {
	constructor(
		message = "Invalid or missing access token",
		options: MonimeErrorOptions = {},
	) {
		super(message, 401, options.requestId, options.details, options.reason);
		this.name = "MonimeAuthenticationError";
	}
}

export class MonimeValidationError extends MonimeError {
	constructor(message: string, details?: unknown) {
		super(message, 400, undefined, details);
		this.name = "MonimeValidationError";
	}
}

/**
 * Returned when an idempotency key is replayed with a different request
 * (URL or body). The API answers `409` with reason `idempotency_key_in_use`.
 */
export class MonimeConflictError extends MonimeError {
	constructor(message: string, options: MonimeErrorOptions = {}) {
		super(message, 409, options.requestId, options.details, options.reason);
		this.name = "MonimeConflictError";
	}
}

export interface MonimeRateLimitErrorOptions extends MonimeErrorOptions {
	/** Seconds to wait before retrying, from the `Retry-After` header. */
	retryAfter?: number | undefined;
	/**
	 * Which limit was triggered, from the `Monime-Rate-Limit` header:
	 * `token-limit`, `space-limit` or `endpoint-limit`.
	 */
	limit?: string | undefined;
}

/** Returned on `429 Too Many Requests`. */
export class MonimeRateLimitError extends MonimeError {
	public readonly retryAfter?: number;
	public readonly limit?: string;

	constructor(message: string, options: MonimeRateLimitErrorOptions = {}) {
		super(message, 429, options.requestId, options.details, options.reason);
		this.name = "MonimeRateLimitError";
		if (options.retryAfter !== undefined) this.retryAfter = options.retryAfter;
		if (options.limit !== undefined) this.limit = options.limit;
	}
}

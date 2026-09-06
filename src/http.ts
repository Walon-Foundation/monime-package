import { randomBytes } from "node:crypto";
import {
	MonimeAuthenticationError,
	MonimeConflictError,
	MonimeError,
	MonimeRateLimitError,
} from "./error";
import type {
	ClientConfig,
	ListOptions,
	MutationOptions,
	Pagination,
	Result,
} from "./types";

export type QueryParams = Record<
	string,
	string | number | boolean | undefined | null
>;

export interface RequestOptions {
	path: string;
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	body?: unknown;
	query?: QueryParams;
	idempotencyKey?: string;
}

/**
 * The envelope every Monime response is wrapped in.
 * @see https://docs.monime.io/developer-resources/api-basics
 */
interface ResponseEnvelope {
	success?: boolean;
	messages?: unknown[];
	result?: unknown;
	pagination?: Pagination;
	error?: {
		code?: number;
		reason?: string;
		message?: string;
		details?: unknown;
	};
}

interface ParsedError {
	message: string;
	reason?: string;
	details?: unknown;
}

export class HttpClient {
	private readonly baseUrl = "https://api.monime.io/v1";
	protected readonly config: ClientConfig;

	constructor(config: ClientConfig) {
		this.config = config;
	}

	private async getHeaders(idempotencyKey?: string): Promise<Headers> {
		const headers = new Headers({
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.config.accessToken}`,
			"Monime-Space-Id": this.config.monimeSpaceId,
		});

		if (this.config.monimeVersion) {
			headers.set("Monime-Version", this.config.monimeVersion);
		}

		if (idempotencyKey) {
			headers.set("Idempotency-Key", idempotencyKey);
		}

		return headers;
	}

	/**
	 * Use the caller's idempotency key when they supplied one, otherwise mint a
	 * fresh one. A generated key only guards against a double-submit inside a
	 * single call — pass your own to make retries across calls safe.
	 */
	protected idempotencyKey(options?: MutationOptions): string {
		return options?.idempotencyKey || randomBytes(20).toString("hex");
	}

	/** Normalize `list()` pagination into query parameters. */
	protected listQuery(options?: ListOptions): QueryParams {
		return {
			limit: options?.limit,
			after: options?.after,
		};
	}

	private buildUrl(path: string, query?: QueryParams): string {
		const url = `${this.baseUrl}${path}`;

		if (!query) return url;

		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			if (value === undefined || value === null || value === "") continue;
			search.set(key, String(value));
		}

		const queryString = search.toString();
		return queryString ? `${url}?${queryString}` : url;
	}

	/**
	 * Pull the human-readable message out of the error envelope:
	 * `{ success: false, messages: [], error: { code, reason, message, details } }`
	 */
	private async parseErrorBody(response: Response): Promise<ParsedError> {
		const fallback = `Request failed with status ${response.status}`;

		try {
			const body = (await response.json()) as ResponseEnvelope & {
				message?: string;
			};
			const apiError = body?.error;

			let message = apiError?.message || body?.message;
			if (!message && Array.isArray(body?.messages)) {
				const first = body.messages.find((m) => typeof m === "string");
				if (typeof first === "string") message = first;
			}

			const parsed: ParsedError = { message: message || fallback };
			if (apiError?.reason !== undefined) parsed.reason = apiError.reason;
			parsed.details = body;
			return parsed;
		} catch {
			// Response was not JSON — keep the status-based fallback.
			return { message: fallback };
		}
	}

	private toError(
		response: Response,
		parsed: ParsedError,
		requestId?: string,
	): MonimeError {
		const { message, reason, details } = parsed;

		switch (response.status) {
			case 401:
				return new MonimeAuthenticationError(message, {
					requestId,
					details,
					reason,
				});
			case 409:
				return new MonimeConflictError(message, { requestId, details, reason });
			case 429: {
				const retryAfter = Number.parseInt(
					response.headers?.get("retry-after") ?? "",
					10,
				);

				return new MonimeRateLimitError(message, {
					requestId,
					details,
					reason,
					retryAfter: Number.isNaN(retryAfter) ? undefined : retryAfter,
					limit: response.headers?.get("monime-rate-limit") ?? undefined,
				});
			}
			default:
				return new MonimeError(
					message,
					response.status,
					requestId,
					details,
					reason,
				);
		}
	}

	protected async request<T>(options: RequestOptions): Promise<Result<T>> {
		const { path, method, body, query, idempotencyKey } = options;
		const url = this.buildUrl(path, query);

		try {
			const response = await fetch(url, {
				method,
				headers: await this.getHeaders(idempotencyKey),
				body: body ? JSON.stringify(body) : null,
			});

			const requestId =
				response.headers?.get("monime-request-id") ||
				response.headers?.get("x-request-id") ||
				undefined;

			if (!response.ok) {
				throw this.toError(
					response,
					await this.parseErrorBody(response),
					requestId,
				);
			}

			if (response.status === 204) {
				return { success: true } as Result<T>;
			}

			const data = (await response.json()) as ResponseEnvelope;
			const resultData = data.result !== undefined ? data.result : data;

			const result: Result<T> = {
				success: true,
				data: resultData as T,
			};

			if (data.pagination) {
				result.pagination = data.pagination;
			}

			return result;
		} catch (error) {
			if (error instanceof MonimeError) {
				return { success: false, error };
			}

			return {
				success: false,
				error:
					error instanceof Error ? error : new Error("Unknown error occurred"),
			};
		}
	}
}

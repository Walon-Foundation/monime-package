import { MonimeAuthenticationError, MonimeError } from "./error";
import type { ClientConfig, Result } from "./types";

export interface RequestOptions {
	path: string;
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	body?: unknown;
	idempotencyKey?: string;
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

	protected async request<T>(options: RequestOptions): Promise<Result<T>> {
		const { path, method, body, idempotencyKey } = options;
		const url = `${this.baseUrl}${path}`;

		try {
			const response = await fetch(url, {
				method,
				headers: await this.getHeaders(idempotencyKey),
				body: body ? JSON.stringify(body) : null,
			});

			const requestId = response.headers?.get("x-request-id") || undefined;

			if (!response.ok) {
				let errorMessage = `Request failed with status ${response.status}`;
				let errorDetails: unknown;

				try {
					const errorData = (await response.json()) as { message?: string };
					errorMessage = errorData.message || errorMessage;
					errorDetails = errorData;
				} catch {
					// Fallback if response is not JSON
				}

				if (response.status === 401) {
					throw new MonimeAuthenticationError(errorMessage);
				}

				throw new MonimeError(
					errorMessage,
					response.status,
					requestId,
					errorDetails,
				);
			}

			if (response.status === 204) {
				return { success: true } as Result<T>;
			}

			const data = (await response.json()) as { result?: unknown };
			const resultData = data.result !== undefined ? data.result : data;

			return {
				success: true,
				data: resultData as T,
			};
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

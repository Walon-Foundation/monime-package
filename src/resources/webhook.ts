import { HttpClient } from "../http";
import type { ListOptions, MutationOptions, Result } from "../types";
import type {
	CreateWebhookRequest,
	CreateWebhookResponse,
	GetWebhookResponse,
	ListWebhooksResponse,
	UpdateWebhookRequest,
	UpdateWebhookResponse,
} from "../types/webhook";
import {
	createWebhookSchema,
	updateWebhookSchema,
} from "../validators/webhook.validator";

export class WebhookAPI extends HttpClient {
	private readonly path = "/webhooks";

	/**
	 * Create a new webhook.
	 */
	async create(
		options: CreateWebhookRequest,
		requestOptions?: MutationOptions,
	): Promise<Result<CreateWebhookResponse>> {
		const validation = createWebhookSchema.safeParse(options);

		if (!validation.success) return this.invalid(validation.error);

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<CreateWebhookResponse>({
			method: "POST",
			path: this.path,
			// apiRelease is required by the API; caph is the latest release.
			body: { ...options, apiRelease: options.apiRelease ?? "caph" },
			idempotencyKey,
		});
	}

	/**
	 * Retrieve a specific webhook by ID.
	 * @param webhookId - The unique identifier of the webhook.
	 */
	async retrieve(webhookId: string): Promise<Result<GetWebhookResponse>> {
		if (!webhookId) return this.invalid("webhookId is required");

		return this.request<GetWebhookResponse>({
			method: "GET",
			path: `${this.path}/${webhookId}`,
		});
	}

	/**
	 * List a page of webhooks.
	 */
	async list(options?: ListOptions): Promise<Result<ListWebhooksResponse>> {
		return this.request<ListWebhooksResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options),
		});
	}

	/**
	 * Update an existing webhook.
	 * @param webhookId - The unique identifier of the webhook.
	 * @param options - The fields to change. The verification method cannot
	 * change; create a new webhook to rotate it.
	 */
	async update(
		webhookId: string,
		options: UpdateWebhookRequest,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdateWebhookResponse>> {
		if (!webhookId) return this.invalid("webhookId is required");

		const validation = updateWebhookSchema.safeParse(options);

		if (!validation.success) return this.invalid(validation.error);

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<UpdateWebhookResponse>({
			method: "PATCH",
			path: `${this.path}/${webhookId}`,
			body: options,
			idempotencyKey,
		});
	}

	/**
	 * Delete a webhook.
	 * @param webhookId - The unique identifier of the webhook.
	 */
	async delete(webhookId: string): Promise<Result<void>> {
		if (!webhookId) return this.invalid("webhookId is required");

		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${webhookId}`,
		});
	}
}

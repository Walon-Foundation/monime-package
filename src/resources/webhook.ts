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

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<CreateWebhookResponse>({
			method: "POST",
			path: this.path,
			body: options,
			idempotencyKey,
		});
	}

	/**
	 * Retrieve a specific webhook by ID.
	 * @param webhookId - The unique identifier of the webhook.
	 */
	async retrieve(webhookId: string): Promise<Result<GetWebhookResponse>> {
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
	 * @param options - The updated webhook data.
	 */
	async update(
		webhookId: string,
		options: UpdateWebhookRequest,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdateWebhookResponse>> {
		const validation = updateWebhookSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

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
		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${webhookId}`,
		});
	}
}

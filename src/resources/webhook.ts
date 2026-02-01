import { HttpClient } from "../http";
import type { Result } from "../types";
import {
	createWebhookSchema,
	updateWebhookSchema,
} from "../validators/webhook.validator";
import type {
	CreateWebhookRequest,
	CreateWebhookResponse,
	GetWebhookResponse,
	ListWebhooksResponse,
	UpdateWebhookRequest,
	UpdateWebhookResponse,
} from "../types/webhook";
import { randomBytes } from "node:crypto";

export class WebhookAPI extends HttpClient {
	private readonly path = "/webhooks";

	/**
	 * Create a new webhook.
	 */
	async create(options: CreateWebhookRequest): Promise<Result<CreateWebhookResponse>> {
		const validation = createWebhookSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const idempotencyKey = randomBytes(20).toString("hex");

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
	 * List all webhooks.
	 */
	async list(): Promise<Result<ListWebhooksResponse>> {
		return this.request<ListWebhooksResponse>({
			method: "GET",
			path: this.path,
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
	): Promise<Result<UpdateWebhookResponse>> {
		const validation = updateWebhookSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const idempotencyKey = randomBytes(20).toString("hex");

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

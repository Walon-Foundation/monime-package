import type { ClientConfig, Result } from "../../types";
import {
	createWebhook,
	deleteWebhook,
	getWebhook,
	listWebhooks,
	updateWebhook,
} from "./webhook";
import type {
	CreateWebhookRequest,
	CreateWebhookResponse,
	GetWebhookResponse,
	ListWebhooksResponse,
	UpdateWebhookRequest,
	UpdateWebhookResponse,
} from "./webhookTypes";

export function WebhookAPI(config: ClientConfig) {
	return {
		create: (body: CreateWebhookRequest) =>
			createWebhook(body, config) as Promise<Result<CreateWebhookResponse>>,
		get: (webhookId: string) =>
			getWebhook(webhookId, config) as Promise<Result<GetWebhookResponse>>,
		getAll: () => listWebhooks(config) as Promise<Result<ListWebhooksResponse>>,
		update: (webhookId: string, body: UpdateWebhookRequest) =>
			updateWebhook(webhookId, body, config) as Promise<
				Result<UpdateWebhookResponse>
			>,
		delete: (webhookId: string) =>
			deleteWebhook(webhookId, config) as Promise<Result<void>>,
	};
}

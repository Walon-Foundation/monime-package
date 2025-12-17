import type { ClientConfig } from "../../types";
import {
	createWebhook,
	deleteWebhook,
	getWebhook,
	listWebhooks,
	updateWebhook,
} from "./webhook";
import type {
	CreateWebhookRequest,
	UpdateWebhookRequest,
} from "./webhookTypes";

export function WebhookAPI(config: ClientConfig) {
	return {
		create: (body: CreateWebhookRequest) => createWebhook(body, config),
		get: (webhookId: string) => getWebhook(webhookId, config),
		getAll: () => listWebhooks(config),
		update: (webhookId: string, body: UpdateWebhookRequest) =>
			updateWebhook(webhookId, body, config),
		delete: (webhookId: string) => deleteWebhook(webhookId, config),
	};
}

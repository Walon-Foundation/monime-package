import type { MonimeClient } from "../../client";
import {
	createWebhook,
	deleteWebhook,
	getWebhook,
	listWebhooks,
	updateWebhook,
} from "./webhook";
import type { CreateWebhookRequest, UpdateWebhookRequest } from "./webhookTypes";

export function WebhookAPI(client: MonimeClient) {
	return {
		create: (body: CreateWebhookRequest) => createWebhook(body, client),
		get: (webhookId: string) => getWebhook(webhookId, client),
		getAll: () => listWebhooks(client),
		update: (webhookId: string, body: UpdateWebhookRequest) =>
			updateWebhook(webhookId, body, client),
		delete: (webhookId: string) => deleteWebhook(webhookId, client),
	};
}

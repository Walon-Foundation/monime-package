import type { Pagination } from "../../types";
export interface WebhookVerificationMethod {
	type: "HS256" | "ES256";
	secret: string;
}

export interface Webhook {
	id: string;
	name: string;
	url: string;
	enabled: boolean;
	events: string[];
	apiRelease: string;
	verificationMethod: WebhookVerificationMethod;
	headers: Record<string, string>;
	alertEmails: string[];
	createTime: string;
	updateTime: string;
	metadata: Record<string, unknown>;
}

export interface CreateWebhookRequest {
	name: string;
	url: string;
	events: string[];
	enabled?: boolean;
	apiRelease?: string;
	headers?: Record<string, string>;
	alertEmails?: string[];
	verificationMethod?: WebhookVerificationMethod;
	metadata?: Record<string, unknown>;
}

export interface CreateWebhookResponse extends Webhook {}

export interface GetWebhookResponse extends Webhook {}

export interface ListWebhooksResponse {
	result: Webhook[];
	pagination?: Pagination;
}

export interface UpdateWebhookRequest {
	name?: string;
	url?: string;
	events?: string[];
	enabled?: boolean;
	headers?: Record<string, string>;
	alertEmails?: string[];
	verificationMethod?: WebhookVerificationMethod;
	metadata?: Record<string, unknown>;
}

export interface UpdateWebhookResponse extends Webhook {}

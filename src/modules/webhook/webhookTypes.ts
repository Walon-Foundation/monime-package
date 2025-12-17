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
	metadata: Record<string, any>;
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
	metadata?: Record<string, any>;
}

export interface CreateWebhookResponse {
	success: boolean;
	messages: string[];
	result: Webhook;
}

export interface GetWebhookResponse {
	success: boolean;
	messages: string[];
	result: Webhook;
}

export interface ListWebhooksResponse {
	success: boolean;
	messages: string[];
	result: Webhook[];
	pagination?: {
		next: string | null;
	};
}

export interface UpdateWebhookRequest {
	name?: string;
	url?: string;
	events?: string[];
	enabled?: boolean;
	headers?: Record<string, string>;
	alertEmails?: string[];
	verificationMethod?: WebhookVerificationMethod;
	metadata?: Record<string, any>;
}

export interface UpdateWebhookResponse {
	success: boolean;
	messages: string[];
	result: Webhook;
}

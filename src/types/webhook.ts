import type { Metadata, MetadataInput } from "./core";

/** The API release a webhook's payloads follow. `caph` is the latest. */
export type WebhookApiRelease = "caph" | "siriusb";

/**
 * How deliveries are signed. HS256 uses a shared secret (32-256 characters).
 * ES256 has no secret: Monime keeps the private key and returns the PEM
 * public key on the webhook.
 */
export type WebhookVerificationMethodInput =
	| { type: "HS256"; secret: string }
	| { type: "ES256" };

export type WebhookVerificationMethod =
	| { type: "HS256"; secret?: string }
	| {
			type: "ES256";
			/** PEM-encoded P-256 public key for verifying deliveries. */
			publicKey?: string;
	  };

export interface Webhook {
	id: string;
	name: string;
	url: string;
	enabled: boolean;
	events: string[] | null;
	apiRelease: WebhookApiRelease;
	verificationMethod: WebhookVerificationMethod | null;
	headers: Record<string, string> | null;
	alertEmails: string[] | null;
	createTime: string;
	updateTime: string | null;
	metadata: Metadata | null;
}

export interface CreateWebhookRequest {
	/** 1 to 100 characters. */
	name: string;
	/** At most 255 characters. */
	url: string;
	/** 1 to 100 event names, e.g. `payout.completed`. */
	events: string[];
	/** Defaults to `true`. */
	enabled?: boolean;
	/** Defaults to `caph`. */
	apiRelease?: WebhookApiRelease;
	/** Extra headers sent with every delivery. */
	headers?: Record<string, string>;
	/** Up to 2 addresses told when deliveries keep failing. */
	alertEmails?: string[];
	verificationMethod?: WebhookVerificationMethodInput;
	metadata?: MetadataInput;
}

/**
 * Fields that can change. The verification method cannot: create a new
 * webhook to rotate it.
 */
export interface UpdateWebhookRequest {
	name?: string | null;
	url?: string | null;
	enabled?: boolean | null;
	apiRelease?: WebhookApiRelease | null;
	events?: string[] | null;
	headers?: Record<string, string> | null;
	alertEmails?: string[] | null;
	metadata?: MetadataInput | null;
}

export type CreateWebhookResponse = Webhook;
export type GetWebhookResponse = Webhook;
export type UpdateWebhookResponse = Webhook;
/** `data` of a list call is the page of webhooks; the cursor is in `pagination`. */
export type ListWebhooksResponse = Webhook[];

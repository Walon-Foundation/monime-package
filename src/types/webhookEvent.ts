/** Event names available on the `caph` release. */
export const WEBHOOK_EVENTS = [
	"checkout_session.cancelled",
	"checkout_session.completed",
	"checkout_session.expired",
	"financial_account.created",
	"financial_account.credited",
	"financial_account.debited",
	"financial_transaction.created",
	"internal_transfer.completed",
	"internal_transfer.created",
	"internal_transfer.failed",
	"payment.created",
	"payment.processing_completed",
	"payment.processing_started",
	"payment_code.cancelled",
	"payment_code.completed",
	"payment_code.expired",
	"payment_code.processed",
	"payout.completed",
	"payout.failed",
	"ussd_otp.expired",
	"ussd_otp.verified",
] as const;

export type WebhookEventName = (typeof WEBHOOK_EVENTS)[number];

/**
 * A webhook delivery. `data` is a partial snapshot of the object: fetch the
 * object by `object.id` before acting on fields it may not carry. Deliveries
 * can repeat or arrive out of order, so de-duplicate on `event.id`.
 */
export interface WebhookEvent<TData = unknown> {
	apiVersion: string;
	event: {
		/** Unique per delivery event, `wke-…`. */
		id: string;
		name: WebhookEventName | (string & {});
		/** Unix time in seconds, as a string. */
		timestamp: string;
	};
	object: {
		id: string;
		type: string;
	};
	data: TData;
}

export interface WebhookVerifyOptions {
	/** The raw request body, exactly as received: never re-serialised JSON. */
	payload: string | Uint8Array;
	/** The `Monime-Signature` header value. */
	header: string | null | undefined;
	/** The webhook's HS256 secret. */
	secret?: string;
	/** The webhook's ES256 public key, PEM encoded (P-256). */
	publicKey?: string;
	/** The current time; defaults to now. A number is milliseconds since the epoch. */
	now?: Date | number;
	/** Oldest accepted delivery, in seconds. Defaults to 300. */
	tolerance?: number;
	/** How far ahead of `now` a timestamp may be, in seconds. Defaults to 60. */
	futureTolerance?: number;
}

import type {
	Amount,
	AmountInput,
	Metadata,
	MetadataInput,
	OwnershipGraph,
} from "./core";
import type { MomoProviderId } from "./payout";

export type PaymentCodeMode = "one_time" | "recurrent";

export const PAYMENT_CODE_STATUSES = [
	"pending",
	"cancelled",
	"processing",
	"expired",
	"completed",
] as const;
export type PaymentCodeStatus = (typeof PAYMENT_CODE_STATUSES)[number];

export interface PaymentCodeRecurrentTargetInput {
	/** At least 1. */
	expectedPaymentCount?: number;
	expectedPaymentTotal?: AmountInput;
}

/**
 * Creates a USSD payment code. Field names match the API. `amount` is in
 * **minor units**: `{ value: 1050 }` is SLE 10.50.
 */
export interface CreatePaymentCodeOptions {
	/** 3 to 64 characters, shown to the payer. */
	name: string;
	/** Defaults to `one_time`. */
	mode?: PaymentCodeMode;
	/** Defaults to `true`. */
	enable?: boolean;
	amount?: AmountInput;
	/** How long the code lives, e.g. `"10m"` (the default) or `"1h30m"`. */
	duration?: string;
	customer?: { name?: string };
	/** Your own reference; at most 64 characters. */
	reference?: string;
	/** 1 to 10 of `m17` (Orange Money) and `m18` (Africell Money). */
	authorizedProviders?: MomoProviderId[];
	/** Only this number may pay the code. */
	authorizedPhoneNumber?: string;
	/** Only meaningful when `mode` is `recurrent`. */
	recurrentPaymentTarget?: PaymentCodeRecurrentTargetInput;
	/** Account the payment lands in (`fac-…`); the Space's main one otherwise. */
	financialAccountId?: string;
	metadata?: MetadataInput;
}

/** Fields that can be changed on a payment code. `null` clears a field. */
export interface UpdatePaymentCodeOptions {
	name?: string | null;
	amount?: AmountInput | null;
	duration?: string | null;
	enable?: boolean | null;
	customer?: { name?: string | null } | null;
	reference?: string | null;
	authorizedProviders?: MomoProviderId[] | null;
	authorizedPhoneNumber?: string | null;
	recurrentPaymentTarget?: PaymentCodeRecurrentTargetInput | null;
	financialAccountId?: string | null;
	metadata?: MetadataInput | null;
}

export interface ListPaymentCodesOptions {
	limit?: number;
	after?: string;
	/** Sent as `ussd_code`. */
	ussdCode?: string;
	mode?: PaymentCodeMode;
	status?: PaymentCodeStatus;
}

export interface PaymentCode {
	id: string;
	mode: PaymentCodeMode;
	status: PaymentCodeStatus;
	name: string | null;
	amount: Amount;
	enable: boolean;
	expireTime: string;
	customer: { name: string | null } | null;
	ussdCode: string;
	reference: string | null;
	authorizedProviders: MomoProviderId[] | null;
	authorizedPhoneNumber: string;
	recurrentPaymentTarget: {
		expectedPaymentCount: number | null;
		expectedPaymentTotal: Amount;
	} | null;
	financialAccountId: string | null;
	processedPaymentData: {
		amount: Amount;
		orderId: string;
		paymentId: string;
		orderNumber: string;
		channelData: { providerId: string; accountId: string; reference: string };
		financialTransactionReference: string;
		metadata: Metadata | null;
	} | null;
	createTime: string;
	updateTime: string | null;
	ownershipGraph: OwnershipGraph | null;
	metadata: Metadata | null;
}

export type CreatePaymentCodeResponse = PaymentCode;
export type RetrievePaymentCodeResponse = PaymentCode;
export type UpdatePaymentCodeResponse = PaymentCode;
/** `data` of a list call is the page of codes; the cursor is in `pagination`. */
export type ListPaymentCodesResponse = PaymentCode[];

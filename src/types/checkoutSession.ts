import type {
	Amount,
	AmountInput,
	Metadata,
	MetadataInput,
	OwnershipGraph,
} from "./core";
import type {
	BankProviderId,
	MomoProviderId,
	WalletProviderId,
} from "./payout";

/** One line on the hosted checkout page. */
export interface CheckoutLineItemInput {
	/** Only `custom` exists today; it is the default. */
	type?: "custom";
	/** At most 100 characters. */
	name: string;
	/** Unit price in minor units. Defaults to SLE. */
	price: AmountInput;
	/** 1 to 100,000; defaults to 1. */
	quantity?: number;
	/** At most 100 characters. */
	reference?: string;
	/** At most 100 characters. */
	description?: string;
	/** Up to 3 image URLs. */
	images?: string[];
}

interface ProviderOption<P extends string> {
	disable?: boolean;
	enabledProviders?: (P | (string & {}))[];
	disabledProviders?: (P | (string & {}))[];
}

/** Which payment methods the checkout page offers. All are on by default. */
export interface CheckoutPaymentOptions {
	card?: { disable?: boolean };
	bank?: ProviderOption<BankProviderId>;
	momo?: ProviderOption<MomoProviderId>;
	wallet?: ProviderOption<WalletProviderId>;
}

/** Creates a hosted checkout session. Field names match the API. */
export interface CreateCheckoutOptions {
	/** At most 150 characters. */
	name: string;
	/** At most 1000 characters. */
	description?: string;
	cancelUrl?: string;
	successUrl?: string;
	/** Returned to you unchanged; at most 255 characters. */
	callbackState?: string;
	/** Your own reference; at most 255 characters. */
	reference?: string;
	/** Account the payment lands in; the Space's main one otherwise. */
	financialAccountId?: string;
	/** 1 to 16 items. */
	lineItems: CheckoutLineItemInput[];
	paymentOptions?: CheckoutPaymentOptions;
	brandingOptions?: { primaryColor?: string };
	metadata?: MetadataInput;
}

export type CheckoutSessionStatus =
	| "pending"
	| "cancelled"
	| "expired"
	| "completed";

export interface CheckoutLineItem {
	type: "custom";
	name: string;
	price: Amount;
	quantity: number;
	reference: string | null;
	description: string | null;
	images: string[] | null;
}

export interface CheckoutSession {
	id: string;
	status: CheckoutSessionStatus;
	name: string;
	orderNumber: string | null;
	reference: string | null;
	description: string | null;
	/** The hosted page to send the payer to. */
	redirectUrl: string;
	cancelUrl: string;
	successUrl: string;
	lineItems: { data: CheckoutLineItem[] | null };
	financialAccountId: string | null;
	brandingOptions: { primaryColor: string } | null;
	expireTime: string;
	createTime: string;
	ownershipGraph: OwnershipGraph | null;
	metadata: Metadata | null;
}

export type CreateCheckoutResponse = CheckoutSession;
export type RetrieveCheckoutResponse = CheckoutSession;
/** `data` of a list call is the page of sessions; the cursor is in `pagination`. */
export type ListCheckoutsResponse = CheckoutSession[];

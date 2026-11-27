import type {
	Amount,
	Fee,
	Metadata,
	MetadataInput,
	OwnershipGraph,
} from "./core";

/** How the payer paid. */
export type PaymentChannel =
	| {
			type: "bank";
			provider: string;
			reference: string;
			accountNumber: string;
			fingerprint: string;
			metadata?: Metadata | null;
	  }
	| {
			type: "card";
			scheme: "mastercard" | "visa";
			last4: string;
			fingerprint: string;
			metadata?: Metadata | null;
	  }
	| {
			type: "wallet";
			provider: string;
			reference: string;
			walletId: string;
			fingerprint: string;
			metadata?: Metadata | null;
	  }
	| {
			type: "momo";
			provider: string;
			reference: string;
			phoneNumber: string;
			fingerprint: string;
			metadata?: Metadata | null;
	  };

export interface Payment {
	id: string;
	/** The API has no failed state for payments. */
	status: "pending" | "processing" | "completed";
	amount: Amount;
	channel: PaymentChannel;
	name: string | null;
	reference: string | null;
	orderNumber: string | null;
	financialAccountId: string | null;
	financialTransactionReference: string | null;
	fees: Fee[] | null;
	createTime: string;
	updateTime: string | null;
	ownershipGraph: OwnershipGraph | null;
	metadata: Metadata | null;
}

export interface ListPaymentsOptions {
	limit?: number;
	after?: string;
	orderNumber?: string;
	financialAccountId?: string;
	financialTransactionReference?: string;
}

/** `null` clears the name; `null` or `""` deletes a metadata key. */
export interface UpdatePaymentOptions {
	/** At most 100 characters. */
	name?: string | null;
	metadata?: MetadataInput | null;
}

export type RetrievePaymentResponse = Payment;
export type UpdatePaymentResponse = Payment;
/** `data` of a list call is the page of payments; the cursor is in `pagination`. */
export type ListPaymentsResponse = Payment[];

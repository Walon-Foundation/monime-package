import type {
	Amount,
	Currency,
	Fee,
	Metadata,
	MetadataInput,
	OwnershipGraph,
} from "./core";

/** Bank providers in the API spec. `/banks?country=SL` may list more. */
export const BANK_PROVIDER_IDS = ["slb001", "slb004", "slb007"] as const;
/** Mobile money providers: `m17` Orange Money, `m18` Africell Money. */
export const MOMO_PROVIDER_IDS = ["m17", "m18"] as const;
/** Digital wallet providers in the API spec. */
export const WALLET_PROVIDER_IDS = ["dw001"] as const;

export type BankProviderId = (typeof BANK_PROVIDER_IDS)[number];
export type MomoProviderId = (typeof MOMO_PROVIDER_IDS)[number];
export type WalletProviderId = (typeof WALLET_PROVIDER_IDS)[number];

/**
 * Where a payout goes. Provider IDs are listed live by the banks and momos
 * endpoints; the known ones are typed, but any ID the API accepts works.
 */
export type PayoutDestination =
	| {
			type: "bank";
			providerId: BankProviderId | (string & {});
			accountNumber: string;
	  }
	| {
			type: "momo";
			providerId: MomoProviderId | (string & {});
			phoneNumber: string;
	  }
	| {
			type: "wallet";
			providerId: WalletProviderId | (string & {});
			walletId?: string;
	  };

/** @deprecated Use {@link PayoutDestination}. */
export type DestinationOption = PayoutDestination;

export interface CreatePayoutOptions {
	/** In minor units: 1050 is SLE 10.50. */
	amount: number;
	/** Defaults to `"SLE"`. */
	currency?: Currency;
	/**
	 * Financial account the money leaves from. When omitted, Monime uses the
	 * Space's main account.
	 */
	sourceAccount?: string;
	destination: PayoutDestination;
	metadata?: MetadataInput;
}

export const PAYOUT_STATUSES = [
	"pending",
	"processing",
	"completed",
	"failed",
] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const PAYOUT_FAILURE_CODES = [
	"unknown",
	"fund_insufficient",
	"authorization_failed",
	"provider_unknown",
	"provider_account_blocked",
	"provider_account_missing",
	"provider_account_quota_exhausted",
] as const;
export type PayoutFailureCode = (typeof PAYOUT_FAILURE_CODES)[number];

export interface ListPayoutsOptions {
	limit?: number;
	after?: string;
	status?: PayoutStatus;
	sourceFinancialAccountId?: string;
	sourceTransactionReference?: string;
	destinationTransactionReference?: string;
}

/** Only metadata can change, and only before the payout is processed. */
export interface UpdatePayoutOptions {
	metadata?: MetadataInput | null;
}

export type PayoutDestinationDetail = PayoutDestination & {
	/** The provider's reference, set once the payout completes. */
	transactionReference?: string | null;
};

export interface Payout {
	id: string;
	status: PayoutStatus;
	amount: Amount;
	source: {
		financialAccountId: string;
		transactionReference: string | null;
	} | null;
	destination: PayoutDestinationDetail;
	/** Charged on top of the amount; empty until processed. */
	fees: Fee[] | null;
	failureDetail: { code: PayoutFailureCode; message: string } | null;
	createTime: string;
	updateTime: string;
	ownershipGraph: OwnershipGraph | null;
	metadata: Metadata | null;
}

export type CreatePayoutResponse = Payout;
export type RetrievePayoutResponse = Payout;
export type UpdatePayoutResponse = Payout;
/** `data` of a list call is the page of payouts; the cursor is in `pagination`. */
export type ListPayoutsResponse = Payout[];

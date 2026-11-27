import type {
	Amount,
	Currency,
	Metadata,
	MetadataInput,
	OwnershipGraph,
} from "./core";

export interface CreateInternalTransferOptions {
	/** Financial account ID the money leaves (at most 64 characters). */
	sourceAccount: string;
	/** Financial account ID the money arrives in, in the same Space. */
	destinationAccount: string;
	/** In minor units: 1050 is SLE 10.50. */
	amount: number;
	/** Defaults to `"SLE"`. */
	currency?: Currency;
	/** At most 150 characters. */
	description?: string;
	metadata?: MetadataInput;
}

export const INTERNAL_TRANSFER_STATUSES = [
	"pending",
	"processing",
	"failed",
	"completed",
] as const;
export type InternalTransferStatus =
	(typeof INTERNAL_TRANSFER_STATUSES)[number];

export interface ListInternalTransfersOptions {
	limit?: number;
	after?: string;
	status?: InternalTransferStatus;
	sourceFinancialAccountId?: string;
	destinationFinancialAccountId?: string;
	financialTransactionReference?: string;
}

/** `null` clears the description; `null` or `""` deletes a metadata key. */
export interface UpdateInternalTransferOptions {
	/** At most 255 characters. */
	description?: string | null;
	metadata?: MetadataInput | null;
}

export interface InternalTransfer {
	id: string;
	status: InternalTransferStatus;
	amount: Amount;
	sourceFinancialAccount: { id: string };
	destinationFinancialAccount: { id: string };
	financialTransactionReference: string | null;
	description: string | null;
	failureDetail: {
		code: "unknown" | "fund_insufficient";
		message: string | null;
	} | null;
	ownershipGraph: OwnershipGraph | null;
	createTime: string;
	updateTime: string | null;
	metadata: Metadata | null;
}

export type CreateInternalTransferResponse = InternalTransfer;
export type RetrieveInternalTransferResponse = InternalTransfer;
export type UpdateInternalTransferResponse = InternalTransfer;
/** `data` of a list call is the page of transfers; the cursor is in `pagination`. */
export type ListInternalTransfersResponse = InternalTransfer[];

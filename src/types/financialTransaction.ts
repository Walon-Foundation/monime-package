import type { Amount, Metadata, OwnershipGraph } from "./core";

/** One entry in a financial account's ledger. */
export interface FinancialTransaction {
	id: string;
	type: "credit" | "debit";
	amount: Amount;
	timestamp: string;
	reference: string | null;
	financialAccount: {
		id: string;
		balance: { after: Amount } | null;
	};
	/** Set when this entry reverses an earlier one. */
	originatingReversal: { originTxnId: string; originTxnRef: string } | null;
	/** Set when this entry is a fee. */
	originatingFee: { code: string } | null;
	/** Leads to the payout, transfer or payment behind the entry. */
	ownershipGraph: OwnershipGraph | null;
	metadata: Metadata | null;
}

export interface ListFinancialTransactionsOptions {
	limit?: number;
	after?: string;
	financialAccountId?: string;
	reference?: string;
	type?: "credit" | "debit";
}

export type RetrieveTransactionResponse = FinancialTransaction;
/** `data` of a list call is the page of entries; the cursor is in `pagination`. */
export type ListTransactionsResponse = FinancialTransaction[];

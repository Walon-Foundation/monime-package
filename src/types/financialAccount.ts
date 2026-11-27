import type { Amount, Currency, Metadata, MetadataInput } from "./core";

export interface CreateFinancialAccountOptions {
	/** Sent as `name`; at most 100 characters. */
	accountName: string;
	currency: Currency;
	/** Your own reference, unique within the Space; at most 64 characters. */
	reference?: string;
	/** At most 150 characters. */
	description?: string;
	metadata?: MetadataInput;
}

export interface RetrieveFinancialAccountOptions {
	/** Include the account's current balance (`balance` is null otherwise). */
	withBalance?: boolean;
}

export interface ListFinancialAccountsOptions {
	limit?: number;
	after?: string;
	uvan?: string;
	reference?: string;
	withBalance?: boolean;
}

/** Fields that can be changed on an account. `null` clears a field. */
export interface UpdateFinancialAccountOptions {
	name?: string | null;
	reference?: string | null;
	description?: string | null;
	metadata?: MetadataInput | null;
}

export interface FinancialAccount {
	id: string;
	/** Alias used to send money into the account from inside or outside Monime. */
	uvan: string;
	name: string;
	currency: string;
	reference: string | null;
	description: string | null;
	/** Present only when requested with `withBalance`. */
	balance: { available: Amount } | null;
	createTime: string;
	updateTime: string | null;
	metadata: Metadata | null;
}

export type CreateFinancialAccountResponse = FinancialAccount;
export type RetrieveFinancialAccountResponse = FinancialAccount;
export type UpdateFinancialAccountResponse = FinancialAccount;
/** `data` of a list call is the page of accounts; the cursor is in `pagination`. */
export type ListFinancialAccountsResponse = FinancialAccount[];

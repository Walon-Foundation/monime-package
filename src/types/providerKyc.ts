import type { Metadata } from "./core";

/** The account holder a provider has on record, e.g. before a payout. */
export interface ProviderKyc {
	account: {
		id: string;
		name: string;
		/** The registered holder's name, to compare with your payee. */
		holderName: string;
		metadata: Metadata | null;
	};
	provider: {
		id: string;
		type: "momo" | "bank" | "wallet";
		name: string;
	};
}

export type GetProviderKycResponse = ProviderKyc;

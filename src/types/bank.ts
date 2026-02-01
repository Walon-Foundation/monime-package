import type { Pagination } from "./core";

export interface BankFeature {
	canPayTo?: boolean;
	canPayFrom?: boolean;
	canVerifyAccount?: boolean;
	schemes?: string[];
	metadata: Record<string, unknown>;
}

export interface BankFeatureSet {
	payout: BankFeature;
	payment: BankFeature;
	kycVerification: BankFeature;
}

export interface Bank {
	providerId: string;
	name: string;
	country: string;
	status: {
		active: boolean;
	};
	featureSet: BankFeatureSet;
	createTime: string;
	updateTime: string;
}

export interface ListBanksResponse {
	result: Bank[];
	pagination: Pagination;
}

export interface RetrieveBankResponse extends Bank {}

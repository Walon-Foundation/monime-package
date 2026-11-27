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
	updateTime: string | null;
}

/** `data` of a list call is the page of providers; the cursor is in `pagination`. */
export type ListBanksResponse = Bank[];

export interface RetrieveBankResponse extends Bank {}

export interface MomoFeature {
	canPayTo?: boolean;
	canPayFrom?: boolean;
	canVerifyAccount?: boolean;
	schemes?: string[];
	metadata: Record<string, unknown>;
}

export interface MomoFeatureSet {
	payout: MomoFeature;
	payment: MomoFeature;
	kycVerification: MomoFeature;
}

export interface Momo {
	providerId: string;
	name: string;
	country: string;
	status: {
		active: boolean;
	};
	featureSet: MomoFeatureSet;
	createTime: string;
	updateTime: string | null;
}

/** `data` of a list call is the page of providers; the cursor is in `pagination`. */
export type ListMomosResponse = Momo[];

export interface RetrieveMomoResponse extends Momo {}

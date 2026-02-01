import type { Pagination } from "./core";

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
	updateTime: string;
}

export interface ListMomosResponse {
	result: Momo[];
	pagination: Pagination;
}

export interface RetrieveMomoResponse extends Momo {}

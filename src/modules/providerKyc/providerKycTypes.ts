export interface ProviderKyc {
	providerId: string;
	[key: string]: any;
}

export interface GetProviderKycResponse extends ProviderKyc {}

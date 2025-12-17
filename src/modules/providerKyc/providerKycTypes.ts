export interface ProviderKyc {
	providerId: string;
	[key: string]: unknown;
}

export interface GetProviderKycResponse extends ProviderKyc {}

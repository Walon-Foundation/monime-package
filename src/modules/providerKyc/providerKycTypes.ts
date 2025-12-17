export interface ProviderKyc {
	providerId: string;
	[key: string]: any;
}

export interface GetProviderKycResponse {
	success: boolean;
	messages: string[];
	result: ProviderKyc;
}

export interface ClientConfig {
	monimeSpaceId: string;
	accessToken: string;
	monimeVersion?: string | undefined;
}

export interface MonimeApiResponse<T> {
	result: T;
	messages: string[];
	pagination?: any;
}

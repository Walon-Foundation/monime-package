export interface ClientConfig {
	monimeSpaceId: string;
	accessToken: string;
	monimeVersion?: string | undefined;
}

export interface Pagination {
	count?: number;
	next: string | null;
}

export interface MonimeApiResponse<T> {
	result: T;
	messages: string[];
	pagination?: Pagination;
}

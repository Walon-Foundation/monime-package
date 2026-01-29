export interface ClientConfig {
	monimeSpaceId: string;
	accessToken: string;
	monimeVersion?: string | undefined;
}

export interface Pagination {
  count: Number,
  next: string
}

export interface Result<T> {
  data?: T,
  success: boolean,
  error?:Error
}

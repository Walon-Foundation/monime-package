import type { Pagination } from "./core";

export interface UssdOtp {
	id: string;
	status: string;
	dialCode: string;
	authorizedPhoneNumber: string;
	verificationMessage: string;
	createTime: string;
	expireTime: string;
	[key: string]: unknown;
}

export interface CreateUssdOtpRequest {
	authorizedPhoneNumber: string;
	[key: string]: unknown;
}

export interface CreateUssdOtpResponse extends UssdOtp {}

export type RetrieveUssdOtpResponse = UssdOtp;

export interface ListUssdOtpsResponse {
	result: UssdOtp[];
	pagination: Pagination;
}

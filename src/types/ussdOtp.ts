import type { Metadata, MetadataInput } from "./core";

export interface UssdOtp {
	id: string;
	status: "pending" | "verified" | "expired";
	/** The USSD code the person dials to verify. */
	dialCode: string;
	authorizedPhoneNumber: string;
	verificationMessage: string | null;
	createTime: string;
	expireTime: string;
	metadata: Metadata | null;
}

export interface CreateUssdOtpRequest {
	/** The only number allowed to dial the code. */
	authorizedPhoneNumber: string;
	/** Shown after verification; at most 255 characters. */
	verificationMessage?: string;
	/** How long the code lives, e.g. `"5m"` (the default). */
	duration?: string;
	metadata?: MetadataInput;
}

export type CreateUssdOtpResponse = UssdOtp;
export type RetrieveUssdOtpResponse = UssdOtp;
/** `data` of a list call is the page of OTPs; the cursor is in `pagination`. */
export type ListUssdOtpsResponse = UssdOtp[];

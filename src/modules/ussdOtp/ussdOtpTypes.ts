export interface UssdOtp {
	id: string;
	phoneNumber: string;
	otp: string;
	expiresAt: string;
	[key: string]: unknown;
}

export interface CreateUssdOtpRequest {
	phoneNumber: string;
	[key: string]: unknown;
}

export interface CreateUssdOtpResponse extends UssdOtp {}

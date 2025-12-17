export interface UssdOtp {
	id: string;
	phoneNumber: string;
	otp: string;
	expiresAt: string;
	[key: string]: any;
}

export interface CreateUssdOtpRequest {
	phoneNumber: string;
	[key: string]: any;
}

export interface CreateUssdOtpResponse extends UssdOtp {}

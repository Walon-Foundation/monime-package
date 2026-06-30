import { randomBytes } from "node:crypto";
import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	CreateUssdOtpRequest,
	CreateUssdOtpResponse,
	ListUssdOtpsResponse,
	RetrieveUssdOtpResponse,
} from "../types/ussdOtp";
import { createUssdOtpSchema } from "../validators/ussdOtp.validator";

export class UssdOtpAPI extends HttpClient {
	private readonly path = "/ussd-otps";

	/**
	 * Create a new USSD OTP.
	 */
	async create(
		options: CreateUssdOtpRequest,
	): Promise<Result<CreateUssdOtpResponse>> {
		const validation = createUssdOtpSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const idempotencyKey = randomBytes(20).toString("hex");

		return this.request<CreateUssdOtpResponse>({
			method: "POST",
			path: this.path,
			body: options,
			idempotencyKey,
		});
	}

	/**
	 * Retrieve a specific USSD OTP by ID.
	 * @param ussdOtpId - The unique identifier of the USSD OTP session.
	 */
	async retrieve(ussdOtpId: string): Promise<Result<RetrieveUssdOtpResponse>> {
		if (!ussdOtpId || ussdOtpId.trim() === "") {
			return { success: false, error: new Error("ussdOtpId is required") };
		}

		return this.request<RetrieveUssdOtpResponse>({
			method: "GET",
			path: `${this.path}/${ussdOtpId}`,
		});
	}

	/**
	 * List all USSD OTPs.
	 */
	async list(): Promise<Result<ListUssdOtpsResponse>> {
		return this.request<ListUssdOtpsResponse>({
			method: "GET",
			path: this.path,
		});
	}

	/**
	 * Delete a USSD OTP.
	 * @param ussdOtpId - The unique identifier of the USSD OTP session.
	 */
	async delete(ussdOtpId: string): Promise<Result<void>> {
		if (!ussdOtpId || ussdOtpId.trim() === "") {
			return { success: false, error: new Error("ussdOtpId is required") };
		}

		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${ussdOtpId}`,
		});
	}
}

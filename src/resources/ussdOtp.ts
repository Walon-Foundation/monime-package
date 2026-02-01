import { HttpClient } from "../http";
import type { Result } from "../types";
import { createUssdOtpSchema } from "../validators/ussdOtp.validator";
import type {
	CreateUssdOtpRequest,
	CreateUssdOtpResponse,
} from "../types/ussdOtp";
import { randomBytes } from "node:crypto";

export class UssdOtpAPI extends HttpClient {
	private readonly path = "/ussd-otps";

	/**
	 * Create a new USSD OTP.
	 */
	async create(body: CreateUssdOtpRequest): Promise<Result<CreateUssdOtpResponse>> {
		const validation = createUssdOtpSchema.safeParse(body);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const idempotencyKey = randomBytes(20).toString("hex");

		return this.request<CreateUssdOtpResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey,
		});
	}
}

import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, MonimeApiResponse } from "../../types";
import type {
	CreateUssdOtpRequest,
	CreateUssdOtpResponse,
} from "./ussdOtpTypes";

const URL = "https://api.monime.io/v1/ussd-otps";

export async function createUssdOtp(
	body: CreateUssdOtpRequest,
	config: ClientConfig,
): Promise<{ success: boolean; data?: CreateUssdOtpResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;
	const idempotencyKey = randomBytes(20).toString("hex");

	try {
		const res = await axios.post(URL, body, {
			headers: {
				"Idempotency-Key": idempotencyKey,
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as MonimeApiResponse<CreateUssdOtpResponse>;
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

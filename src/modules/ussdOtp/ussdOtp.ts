import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
import type {
	CreateUssdOtpRequest,
	CreateUssdOtpResponse,
} from "./ussdOtpTypes";

const URL = "https://api.monime.io/v1/ussd-otps";

export async function createUssdOtp(
	body: CreateUssdOtpRequest,
	client: MonimeClient,
): Promise<{ success: boolean; data?: CreateUssdOtpResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();
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
		return { success: true, data: res.data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

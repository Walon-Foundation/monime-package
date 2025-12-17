import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, MonimeApiResponse } from "../../types";
import type { GetReceiptResponse, RedeemReceiptResponse } from "./receiptTypes";

const URL = "https://api.monime.io/v1/receipts";

export async function getReceipt(
	orderNumber: string,
	config: ClientConfig,
): Promise<{ success: boolean; data?: GetReceiptResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(`${URL}/${orderNumber}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as MonimeApiResponse<GetReceiptResponse>;
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function redeemReceipt(
	orderNumber: string,
	body: Record<string, any>,
	config: ClientConfig,
): Promise<{ success: boolean; data?: RedeemReceiptResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;
	const idempotencyKey = randomBytes(20).toString("hex");

	try {
		const res = await axios.post(`${URL}/${orderNumber}/redeem`, body, {
			headers: {
				"Idempotency-Key": idempotencyKey,
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as MonimeApiResponse<RedeemReceiptResponse>;
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

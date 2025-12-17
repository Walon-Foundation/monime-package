import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
import type {
	GetPayment,
	ListPayments,
	PatchPayment,
} from "./paymentTypes";

const URL = "https://api.monime.io/v1/payments";

export async function getPayment(
	paymentId: string,
	client: MonimeClient,
): Promise<{ success: boolean; data?: GetPayment; error?: Error }> {
	if (!paymentId) {
		return { success: false, error: new Error("paymentId is required") };
	}

	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();

	try {
		const res = await axios.get(`${URL}/${paymentId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
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

export async function listPayments(
	client: MonimeClient,
	params?: Record<string, any>,
): Promise<{ success: boolean; data?: ListPayments; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();

	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
			params,
		});
		return { success: true, data: res.data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function patchPayment(
	paymentId: string,
	body: Record<string, any>,
	client: MonimeClient,
): Promise<{ success: boolean; data?: PatchPayment; error?: Error }> {
	if (!paymentId) {
		return { success: false, error: new Error("paymentId is required") };
	}

	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();
	const idempotencyKey = randomBytes(20).toString("hex");

	try {
		const res = await axios.patch(`${URL}/${paymentId}`, body, {
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

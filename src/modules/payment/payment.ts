import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import type { GetPayment, ListPayments, PatchPayment } from "./paymentTypes";

const URL = "https://api.monime.io/v1/payments";

export async function getPayment(
	paymentId: string,
	config: ClientConfig,
): Promise<Result<GetPayment>> {
	if (!paymentId) {
		return { success: false, error: new Error("paymentId is required") };
	}

	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(`${URL}/${paymentId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as { result: GetPayment };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function listPayments(
	config: ClientConfig,
	params?: Record<string, unknown>,
): Promise<Result<ListPayments>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
			params,
		});
		const response = res.data as ListPayments;
		return {
			success: true,
			data: response,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

import { patchPaymentSchema } from "../../validators/payment.validator";

export async function patchPayment(
	paymentId: string,
	body: Record<string, unknown>,
	config: ClientConfig,
): Promise<Result<PatchPayment>> {
	if (!paymentId) {
		return { success: false, error: new Error("paymentId is required") };
	}

	const validation = patchPaymentSchema.safeParse(body);
	if (!validation.success) {
		return { success: false, error: new Error(validation.error.message) };
	}

	const { monimeSpaceId, accessToken, monimeVersion } = config;
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
		const response = res.data as { result: PatchPayment };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

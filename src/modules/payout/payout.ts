import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import type {
	CreatePayout,
	DestinationOption,
	GetAll,
	GetOnePayout,
} from "./payoutTypes";

const URL = "https://api.monime.io/v1/payouts";
const value = randomBytes(20).toString("hex");

import { createPayoutSchema } from "../../validators/payout.validator";

export async function createPayout(
	amount: number,
	sourceAccount: string,
	destination: DestinationOption,
	config: ClientConfig,
): Promise<Result<CreatePayout>> {
	const validation = createPayoutSchema.safeParse({
		amount,
		sourceAccount,
		destination,
	});

	if (!validation.success) {
		return { success: false, error: new Error(validation.error.message) };
	}

	const { accessToken, monimeSpaceId, monimeVersion } = config;

	const body = {
		amount: {
			currency: "SLE",
			value: amount,
		},
		source: {
			financialAccountId: sourceAccount,
		},
		destination: destination,
		metadata: {},
	};

	try {
		const res = await axios.post(URL, body, {
			headers: {
				"Idempotency-Key": `${value}`,
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as { result: CreatePayout };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

export async function getAllPayout(
	config: ClientConfig,
): Promise<Result<GetAll>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as GetAll;
		return {
			success: true,
			data: response,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

export async function getPayout(
	payoutId: string,
	config: ClientConfig,
): Promise<Result<GetOnePayout>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		const res = await axios.get(`${URL}/${payoutId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as { result: GetOnePayout };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

export async function deletePayout(
	payoutId: string,
	config: ClientConfig,
): Promise<Result<void>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		await axios.delete(`${URL}/${payoutId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		return { success: true };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

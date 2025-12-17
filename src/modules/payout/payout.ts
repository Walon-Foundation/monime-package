import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, MonimeApiResponse } from "../../types";
import type {
	CreatePayout,
	DestinationOption,
	GetAll,
	GetOnePayout,
} from "./payoutTypes";

const URL = "https://api.monime.io/v1/payouts";
const value = randomBytes(20).toString("hex");

interface Return {
	data?: CreatePayout;
	error?: Error;
	success: boolean;
}

export async function createPayout(
	amount: number,
	sourceAccount: string,
	destination: DestinationOption,
	config: ClientConfig,
): Promise<Return> {
	if (sourceAccount.trim() === "") {
		return {
			success: false,
			error: new Error("sourceAccount cannot be empty"),
		};
	}

	if (amount <= 0) {
		return {
			error: new Error("amount must be greater than 0"),
			success: false,
		};
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

		const response = res.data as MonimeApiResponse<CreatePayout>;
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

interface GetAllReturn {
	success: boolean;
	data?: GetAll;
	error?: Error;
}

export async function getAllPayout(config: ClientConfig): Promise<GetAllReturn> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as MonimeApiResponse<GetAll["result"]>;
		return {
			success: true,
			data: { result: response.result, pagination: response.pagination },
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

interface GetOneReturn {
	success: boolean;
	data?: GetOnePayout;
	error?: Error;
}

export async function getPayout(
	payoutId: string,
	config: ClientConfig,
): Promise<GetOneReturn> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		const res = await axios.get(`${URL}/${payoutId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as MonimeApiResponse<GetOnePayout>;
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

interface DeleteReturn {
	success: boolean;
	error?: Error;
}

export async function deletePayout(
	payoutId: string,
	config: ClientConfig,
): Promise<DeleteReturn> {
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

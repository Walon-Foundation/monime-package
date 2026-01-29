import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import { createInternalTransferSchema } from "../../validators/internalTransfer.validator";
import type {
	AllInternalTransfers,
	CreateInternalTransfer,
	InternalTransfer,
} from "./internalTransferTypes";

const URL = "https://api.monime.io/v1/internal-transfers";
const value = randomBytes(20).toString("hex");

export async function createInternalTransfer(
	sourceAccount: string,
	destinationAccount: string,
	config: ClientConfig,
	amount: number,
): Promise<Result<CreateInternalTransfer>> {
	const validation = createInternalTransferSchema.safeParse({
		sourceAccount,
		destinationAccount,
		amount,
	});

	if (!validation.success) {
		return { success: false, error: new Error(validation.error.message) };
	}

	const body = {
		amount: {
			currency: "SLE",
			value: amount,
		},
		sourceFinancialAccount: {
			id: sourceAccount,
		},
		destinationFinancialAccount: {
			id: destinationAccount,
		},
		metadata: {},
	};

	const { accessToken, monimeSpaceId, monimeVersion } = config;

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

		const response = res.data as { result: CreateInternalTransfer };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unkknown error"), success: false };
	}
}

export async function getAllInternalTransfers(
	config: ClientConfig,
): Promise<Result<AllInternalTransfers>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as AllInternalTransfers;
		return {
			success: true,
			data: response,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { error: new Error("unkknown error"), success: false };
	}
}

export async function getInternalTransfer(
	config: ClientConfig,
	internalTransferId: string,
): Promise<Result<InternalTransfer>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;

	try {
		const res = await axios.get(`${URL}/${internalTransferId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as { result: InternalTransfer };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { error: new Error("unkknown error"), success: false };
	}
}

export async function deleteInternalTransfer(
	config: ClientConfig,
	internalTransferId: string,
): Promise<Result<void>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		await axios.delete(`${URL}/${internalTransferId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		return { success: true };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

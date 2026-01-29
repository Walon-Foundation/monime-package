import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import type {
	AllTransaction,
	GetTransaction,
} from "./financialTransactionTypes";

const URL = "https://api.monime.io/v1/financial-transactions";

export async function getAllTransaction(
	config: ClientConfig,
): Promise<Result<AllTransaction>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;
	try {
		const res = await axios.get(URL, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Monime-Space-Id": `${monimeSpaceId}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as AllTransaction;
		return {
			success: true,
			data: response,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

export async function getTransaction(
	config: ClientConfig,
	transactionId: string,
): Promise<Result<GetTransaction>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	if (transactionId.trim() === "") {
		return {
			error: new Error("transactionId must not be empty"),
			success: false,
		};
	}

	try {
		const res = await axios.get(`${URL}/${transactionId}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Monime-Space-Id": `${monimeSpaceId}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as { result: GetTransaction };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

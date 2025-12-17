import axios from "axios";
import type { ClientConfig } from "../../types";
import type {
	AllTransaction,
	GetTransaction,
} from "./financialTransactionTypes";

const URL = "https://api.monime.io/v1/financial-transactions";

interface GetAllTransactionReturn {
	success: boolean;
	error?: Error;
	data?: AllTransaction;
}

export async function getAllTransaction(
	config: ClientConfig,
): Promise<GetAllTransactionReturn> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;
	try {
		const res = await axios.get(URL, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Monime-Space-Id": `${monimeSpaceId}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const data = res.data as AllTransaction;
		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

interface GetTransactionReturn {
	success: boolean;
	error?: Error;
	data?: GetTransaction;
}

export async function getTransaction(
	config: ClientConfig,
	transactionId: string,
): Promise<GetTransactionReturn> {
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
		const data = res.data as GetTransaction;
		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

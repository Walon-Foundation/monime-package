import axios from "axios";
import type { MonimeClient } from "../../client";
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
	client: MonimeClient,
): Promise<GetAllTransactionReturn> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();
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
	client: MonimeClient,
	transactionId: string,
): Promise<GetTransactionReturn> {
	const { accessToken, monimeSpaceId, monimeVersion } = client._getConfig();
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

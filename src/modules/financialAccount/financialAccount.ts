import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
import type {
	AllFinancialAccount,
	CreateFinancialAccount,
	GetFinancialAccount,
} from "./financialAccountTypes";

const URL = "https://api.monime.io/v1/financial-accounts";
const value = randomBytes(20).toString("hex");

interface createFinancialAccountReturn {
	data?: CreateFinancialAccount;
	error?: Error;
	success: boolean;
}

export type Currency = "USD" | "SLE";

export async function createFinancialAccount(
	accountName: string,
	currency: Currency,
	client: MonimeClient,
): Promise<createFinancialAccountReturn> {
	if (accountName.trim() === "") {
		return { success: false, error: new Error("accountName is required") };
	}

	const body = {
		name: accountName,
		currency: currency,
		description: "",
		metadata: {},
	};

	//getting the accessToken and monime space id
	const { accessToken, monimeSpaceId } = client._getConfig();

	try {
		const res = await axios.post(URL, body, {
			headers: {
				"Idempotency-Key": `${value}`,
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		const data = res.data as CreateFinancialAccount;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

interface GetFinancialAccountReturn {
	data?: GetFinancialAccount;
	error?: Error;
	success: boolean;
}

export async function getFinancialAccount(
	financialAccountId: string,
	client: MonimeClient,
): Promise<GetFinancialAccountReturn> {
	if (financialAccountId.trim() === "") {
		return {
			success: false,
			error: new Error("financialAccountId is required"),
		};
	}

	const { monimeSpaceId, accessToken } = client._getConfig();
	try {
		const res = await axios.get(`${URL}/${financialAccountId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = res.data as GetFinancialAccount;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

interface GetAllFinancialAccount {
	success: boolean;
	error?: Error;
	data?: AllFinancialAccount;
}

export async function getAllFinancialAccount(
	client: MonimeClient,
): Promise<GetAllFinancialAccount> {
	const { monimeSpaceId, accessToken } = client._getConfig();

	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
			},
		});
		const data = res.data as AllFinancialAccount;

		return { success: true, data: data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import type {
	AllFinancialAccount,
	CreateFinancialAccount,
	GetFinancialAccount,
} from "./financialAccountTypes";

const URL = "https://api.monime.io/v1/financial-accounts";
const value = randomBytes(20).toString("hex");

export type Currency = "USD" | "SLE";

import { createFinancialAccountSchema } from "../../validators/financialAccount.validator";

export async function createFinancialAccount(
	accountName: string,
	currency: Currency,
	config: ClientConfig,
): Promise<Result<CreateFinancialAccount>> {
	const validation = createFinancialAccountSchema.safeParse({
		accountName,
		currency,
	});

	if (!validation.success) {
		return { success: false, error: new Error(validation.error.message) };
	}

	const body = {
		name: accountName,
		currency: currency,
		description: "",
		metadata: {},
	};

	//getting the accessToken and monime space id
	//getting the accessToken and monime space id
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

		const response = res.data as { result: CreateFinancialAccount };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

export async function getFinancialAccount(
	financialAccountId: string,
	config: ClientConfig,
): Promise<Result<GetFinancialAccount>> {
	if (financialAccountId.trim() === "") {
		return {
			success: false,
			error: new Error("financialAccountId is required"),
		};
	}

	const { monimeSpaceId, accessToken, monimeVersion } = config;
	try {
		const res = await axios.get(`${URL}/${financialAccountId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as { result: GetFinancialAccount };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

export async function getAllFinancialAccount(
	config: ClientConfig,
): Promise<Result<AllFinancialAccount>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as AllFinancialAccount;
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

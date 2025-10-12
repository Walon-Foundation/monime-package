import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
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
	client: MonimeClient,
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

	const { accessToken, monimeSpaceId } = client._getConfig();

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
			},
		});

		const data = res.data as CreatePayout;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

interface AllPayout {
	success: boolean;
	data?: GetAll;
	error?: Error;
}

export async function getAllPayout(client: MonimeClient): Promise<AllPayout> {
	const { accessToken, monimeSpaceId } = client._getConfig();
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = res.data as GetAll;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

interface OnePayout {
	success: boolean;
	data?: GetOnePayout;
	error?: Error;
}

export async function getPayout(
	payoutId: string,
	client: MonimeClient,
): Promise<OnePayout> {
	const { accessToken, monimeSpaceId } = client._getConfig();
	try {
		const res = await axios.get(`${URL}/${payoutId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = res.data as GetOnePayout;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { success: false, error: new Error("unknown error") };
	}
}

interface Delete {
	success: boolean;
	error?: Error;
}

export async function deletePayout(
	payoutId: string,
	client: MonimeClient,
): Promise<Delete> {
	const { accessToken, monimeSpaceId } = client._getConfig();
	try {
		await axios.delete(`${URL}/${payoutId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
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

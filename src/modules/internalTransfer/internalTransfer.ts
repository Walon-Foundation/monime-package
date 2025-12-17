import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
import type {
	AllInternalTransfers,
	CreateInternalTransfer,
	InternalTransfer,
} from "./internalTransferTypes";

const URL = "https://api.monime.io/v1/internal-transfers";
const value = randomBytes(20).toString("hex");

interface Return {
	data?: CreateInternalTransfer;
	error?: Error;
	success: boolean;
}

export async function createInternalTransfer(
	sourceAccount: string,
	destinationAccount: string,
	client: MonimeClient,
	amount: number,
): Promise<Return> {
	if (amount <= 0) {
		return {
			success: false,
			error: new Error("amount must be larger that zero"),
		};
	}

	if (sourceAccount.trim() === "" || destinationAccount.trim() === "") {
		return {
			success: false,
			error: new Error("sourceAccount or destinationAccount is missing"),
		};
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

	const { accessToken, monimeSpaceId, monimeVersion } = client._getConfig();

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

		const data = res.data as CreateInternalTransfer;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unkknown error"), success: false };
	}
}

interface AllInternalTransfersResult {
	success: boolean;
	error?: Error;
	data?: AllInternalTransfers;
}

export async function getAllInternalTransfers(
	client: MonimeClient,
): Promise<AllInternalTransfersResult> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const data = res.data as AllInternalTransfers;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { error: new Error("unkknown error"), success: false };
	}
}

interface InternalTransferResult {
	success: boolean;
	error?: Error;
	data?: InternalTransfer;
}

export async function getInternalTransfer(
	client: MonimeClient,
	internalTransferId: string,
): Promise<InternalTransferResult> {
	const { accessToken, monimeSpaceId, monimeVersion } = client._getConfig();

	try {
		const res = await axios.get(`${URL}/${internalTransferId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const data = res.data as InternalTransfer;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error: error };
		}

		return { error: new Error("unkknown error"), success: false };
	}
}

interface DeleteTransferResult {
	success: boolean;
	error?: Error;
}

export async function deleteInternalTransfer(
	client: MonimeClient,
	internalTransferId: string,
): Promise<DeleteTransferResult> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();

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

import axios from "axios";
import { randomBytes } from "crypto";
import type { MonimeClient } from "../../client";
import type { CreateInternalTransfer } from "./internalTransferTypes";

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
	value: number,
): Promise<Return> {
	if (value <= 0) {
		return {
			success: false,
			error: new Error("value must be larger that zero"),
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
			value: value,
		},
		sourceFinancialAccount: {
			id: sourceAccount,
		},
		destinationFinancialAccount: {
			id: destinationAccount,
		},
		metadata: {},
	};

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

		const data = res.data as CreateInternalTransfer;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unkknown error"), success: false };
	}
}

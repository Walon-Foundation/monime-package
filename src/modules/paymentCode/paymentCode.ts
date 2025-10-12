import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
import type {
	CreatePaymentCode,
	GetAllPaymentCode,
	GetOne,
} from "./paymentCodeTypes";

const value = randomBytes(20).toString("hex");
const URL = "https://api.monime.io/v1/payment-codes";

interface Return {
	data?: CreatePaymentCode;
	error?: Error;
	success: boolean;
}

export async function createPaymentCode(
	paymentName: string,
	amount: number,
	financialAccountId: string | null,
	name: string,
	phoneNumber: string,
	client: MonimeClient,
): Promise<Return> {
	let financialAccount = null;
	if (financialAccountId !== "") {
		financialAccount = financialAccountId;
	}

	if (
		paymentName.trim() === "" ||
		name.trim() === "" ||
		phoneNumber.trim() === ""
	) {
		return {
			success: false,
			error: new Error("paymentName, name, or phoneNumber is missing"),
		};
	}

	if (amount <= 0) {
		return {
			success: false,
			error: new Error("amonut number be greater than zero"),
		};
	}

	const { accessToken, monimeSpaceId } = client._getConfig();

	const bodyData = {
		name: `${paymentName}`,
		mode: "recurrent",
		enable: true,
		amount: {
			currency: "SLE",
			value: amount * 100,
		},
		duration: "1h30m",
		customer: {
			name: `${name}`,
		},
		reference: "",
		authorizedPhoneNumber: phoneNumber,
		// authorizedProviders: ["m17", "m18"],
		recurrentPaymentTarget: {
			expectedPaymentCount: 1,
			expectedPaymentTotal: {
				currency: "SLE",
				value: amount * 100,
			},
		},
		financialAccountId: financialAccount,
		metadata: {},
	};

	try {
		const res = await axios.post(URL, bodyData, {
			headers: {
				"Idempotency-Key": `${value}`,
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		const data = res.data as CreatePaymentCode;
		return { data: data, success: true };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error.response?.data, success: false };
		}
		return { error: new Error("unknown error"), success: false };
	}
}

interface DeleteReturn {
	success: boolean;
	error?: Error;
}

export async function deletePaymentCode(
	paymentCodeId: string,
	client: MonimeClient,
): Promise<DeleteReturn> {
	const { accessToken, monimeSpaceId } = client._getConfig();

	if (paymentCodeId.trim() === "") {
		return { success: false, error: new Error("paymentCodeId is required") };
	}

	try {
		await axios.delete(`${URL}/${paymentCodeId}`, {
			headers: {
				"Idempotency-Key": `${value}`,
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		})

		return { success: true };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}
		return { error: new Error("unknown error"), success: false };
	}
}

interface GetAll {
	success: boolean;
	error?: Error;
	data?: GetAllPaymentCode;
}

export async function getAllPaymentCode(client: MonimeClient): Promise<GetAll> {
	const { monimeSpaceId, accessToken } = client._getConfig();
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = res.data as GetAllPaymentCode;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}
		return { error: new Error("unknown error"), success: false };
	}
}

interface GetOneReturn {
	success: boolean;
	data?: GetOne;
	error?: Error;
}

export async function getPaymentCode(
	paymentCodeId: string,
	client: MonimeClient,
): Promise<GetOneReturn> {
	const { monimeSpaceId, accessToken } = client._getConfig();
	try {
		const res = await axios.get(`${URL}/${paymentCodeId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = res.data as GetOne;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}
		return { error: new Error("unknown error"), success: false };
	}
}

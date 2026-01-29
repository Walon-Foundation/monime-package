import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import type {
	CreatePaymentCode,
	GetAllPaymentCode,
	GetOne,
} from "./paymentCodeTypes";

const value = randomBytes(20).toString("hex");
const URL = "https://api.monime.io/v1/payment-codes";

import { createPaymentCodeSchema } from "../../validators/paymentCode.validator";

export async function createPaymentCode(
	paymentName: string,
	amount: number,
	financialAccountId: string | null,
	name: string,
	phoneNumber: string,
	config: ClientConfig,
): Promise<Result<CreatePaymentCode>> {
	let financialAccount = null;
	if (financialAccountId !== "") {
		financialAccount = financialAccountId;
	}

	const validation = createPaymentCodeSchema.safeParse({
		paymentName,
		amount,
		financialAccountId,
		name,
		phoneNumber,
	});

	if (!validation.success) {
		return { success: false, error: new Error(validation.error.message) };
	}

	const { accessToken, monimeSpaceId, monimeVersion } = config;

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
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as { result: CreatePaymentCode };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error.response?.data, success: false };
		}
		return { error: new Error("unknown error"), success: false };
	}
}

export async function deletePaymentCode(
	paymentCodeId: string,
	config: ClientConfig,
): Promise<Result<void>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;

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
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		return { success: true };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}
		return { error: new Error("unknown error"), success: false };
	}
}

export async function getAllPaymentCode(
	config: ClientConfig,
): Promise<Result<GetAllPaymentCode>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as GetAllPaymentCode;
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

export async function getPaymentCode(
	paymentCodeId: string,
	config: ClientConfig,
): Promise<Result<GetOne>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;
	try {
		const res = await axios.get(`${URL}/${paymentCodeId}`, {
			headers: {
				"Monime-Space-Id": `${monimeSpaceId}`,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as { result: GetOne };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}
		return { error: new Error("unknown error"), success: false };
	}
}

import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
import type {
	AllCheckout,
	CreateCheckout,
	OneCheckout,
} from "./checkoutSessionType";

const value = randomBytes(20).toString("hex");
const URL = "https://api.monime.io/v1/checkout-sessions";

interface CreateCheckoutReturn {
	success: boolean;
	data?: CreateCheckout;
	error?: Error;
}

export async function createCheckout(
	client: MonimeClient,
	name: string,
	amount: number,
	quantity: number,
	successUrl: string,
	cancelUrl: string,
	description?: string,
	financialAccountId?: string,
	primaryColor?: string,
	images?: string[],
): Promise<CreateCheckoutReturn> {
	const { monimeSpaceId, accessToken } = client._getConfig();
	const body = {
		name: name,
		description: description,
		cancelUrl,
		successUrl,
		callbackState: null,
		reference: null,
		financialAccountId: financialAccountId,
		lineItems: [
			{
				type: "custom",
				name,
				price: {
					currency: "SLE",
					value: amount,
				},
				quantity,
				reference: null,
				description: description,
				images: images,
			},
		],
		paymentOptions: {
			card: {
				disable: false,
			},
			bank: {
				disable: false,
				enabledProviders: ["slb001", "slb004", "slb007"],
				// disabledProviders: ["slb001"],
			},
			momo: {
				disable: false,
				enabledProviders: ["m17", "m18"],
				// disabledProviders: ["m17"],
			},
			wallet: {
				disable: false,
				enabledProviders: ["dw001"],
				// disabledProviders: ["dw001"],
			},
		},
		brandingOptions: {
			primaryColor: primaryColor,
		},
		metadata: {},
	};

	try {
		const res = await axios.post(URL, body, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				"Idempotency-Key": value,
				"Monime-Version": "caph.2025-08-23",
			},
		});
		const data = res.data as CreateCheckout;
		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

interface AllReturn {
	success: boolean;
	data?: AllCheckout;
	error?: Error;
}

export async function getAllCheckout(client: MonimeClient): Promise<AllReturn> {
	const { accessToken, monimeSpaceId } = client._getConfig();
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = res.data as AllCheckout;

		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

interface OneReturn {
	success: boolean;
	data?: OneCheckout;
	error?: Error;
}

export async function getOnecheckout(
	client: MonimeClient,
	checkoutId: string,
): Promise<OneReturn> {
	const { accessToken, monimeSpaceId } = client._getConfig();
	try {
		const res = await axios.get(`${URL}/${checkoutId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = res.data as OneCheckout;
		return { success: true, data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

interface DeleteCheckout {
	success: boolean;
	error?: Error;
}

export async function deleteCheckout(
	client: MonimeClient,
	checkoutId: string,
): Promise<DeleteCheckout> {
	const { accessToken, monimeSpaceId } = client._getConfig();
	try {
		await axios.delete(`${URL}/${checkoutId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
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

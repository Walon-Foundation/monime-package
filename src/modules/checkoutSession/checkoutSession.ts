import { randomBytes } from "node:crypto";
import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import { createCheckoutSchema } from "../../validators/checkoutSession.validator";
import type {
	AllCheckout,
	CreateCheckout,
	OneCheckout,
} from "./checkoutSessionType";

const value = randomBytes(20).toString("hex");
const URL = "https://api.monime.io/v1/checkout-sessions";

export async function createCheckout(
	config: ClientConfig,
	name: string,
	amount: number,
	quantity: number,
	successUrl: string,
	cancelUrl: string,
	description?: string,
	financialAccountId?: string,
	primaryColor?: string,
	images?: string[],
): Promise<Result<CreateCheckout>> {
	const validation = createCheckoutSchema.safeParse({
		name,
		amount,
		quantity,
		successUrl,
		cancelUrl,
		description,
		financialAccountId,
		primaryColor,
		images,
	});

	if (!validation.success) {
		return { success: false, error: new Error(validation.error.message) };
	}
	const { monimeSpaceId, accessToken, monimeVersion } = config;
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
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as CreateCheckout;
		return { success: true, data: response };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

export async function getAllCheckout(
	config: ClientConfig,
): Promise<Result<AllCheckout>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as AllCheckout;
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

export async function getOnecheckout(
	config: ClientConfig,
	checkoutId: string,
): Promise<Result<OneCheckout>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		const res = await axios.get(`${URL}/${checkoutId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});

		const response = res.data as OneCheckout;
		return { success: true, data: response };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { error: error, success: false };
		}

		return { error: new Error("unknown error"), success: false };
	}
}

export async function deleteCheckout(
	config: ClientConfig,
	checkoutId: string,
): Promise<Result<any>> {
	const { accessToken, monimeSpaceId, monimeVersion } = config;
	try {
		await axios.delete(`${URL}/${checkoutId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
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

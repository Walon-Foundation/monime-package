import { randomBytes } from "node:crypto";
import axios from "axios";
import type { MonimeClient } from "../../client";
import type {
	CreateWebhookRequest,
	CreateWebhookResponse,
	GetWebhookResponse,
	ListWebhooksResponse,
	UpdateWebhookRequest,
	UpdateWebhookResponse,
} from "./webhookTypes";

const URL = "https://api.monime.io/v1/webhooks";

export async function createWebhook(
	body: CreateWebhookRequest,
	client: MonimeClient,
): Promise<{ success: boolean; data?: CreateWebhookResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();
	const idempotencyKey = randomBytes(20).toString("hex");

	try {
		const res = await axios.post(URL, body, {
			headers: {
				"Idempotency-Key": idempotencyKey,
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		return { success: true, data: res.data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function getWebhook(
	webhookId: string,
	client: MonimeClient,
): Promise<{ success: boolean; data?: GetWebhookResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();

	try {
		const res = await axios.get(`${URL}/${webhookId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		return { success: true, data: res.data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function listWebhooks(
	client: MonimeClient,
): Promise<{ success: boolean; data?: ListWebhooksResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();

	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		return { success: true, data: res.data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function updateWebhook(
	webhookId: string,
	body: UpdateWebhookRequest,
	client: MonimeClient,
): Promise<{ success: boolean; data?: UpdateWebhookResponse; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();
	const idempotencyKey = randomBytes(20).toString("hex");

	try {
		const res = await axios.patch(`${URL}/${webhookId}`, body, {
			headers: {
				"Idempotency-Key": idempotencyKey,
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		return { success: true, data: res.data };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function deleteWebhook(
	webhookId: string,
	client: MonimeClient,
): Promise<{ success: boolean; error?: Error }> {
	const { monimeSpaceId, accessToken, monimeVersion } = client._getConfig();

	try {
		await axios.delete(`${URL}/${webhookId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		return { success: true };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

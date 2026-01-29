import axios from "axios";
import type { ClientConfig, Result } from "../../../types";
import type { GetBankResponse, ListBanksResponse } from "./bankTypes";

const URL = "https://api.monime.io/v1/banks";

export async function getBank(
	providerId: string,
	config: ClientConfig,
): Promise<Result<GetBankResponse>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(`${URL}/${providerId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as { result: GetBankResponse };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function listBanks(
	config: ClientConfig,
	params?: Record<string, unknown>,
): Promise<Result<ListBanksResponse>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(URL, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
			params,
		});
		const response = res.data as ListBanksResponse;
		return {
			success: true,
			data: response,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

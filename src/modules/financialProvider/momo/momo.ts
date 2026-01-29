import axios from "axios";
import type { ClientConfig, Result } from "../../../types";
import type { GetMomoResponse, ListMomosResponse } from "./momoTypes";

const URL = "https://api.monime.io/v1/momos";

export async function getMomo(
	providerId: string,
	config: ClientConfig,
): Promise<Result<GetMomoResponse>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(`${URL}/${providerId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as { result: GetMomoResponse };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

export async function listMomos(
	config: ClientConfig,
	params?: Record<string, unknown>,
): Promise<Result<ListMomosResponse>> {
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
		const response = res.data as ListMomosResponse;
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

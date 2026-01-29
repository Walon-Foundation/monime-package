import axios from "axios";
import type { ClientConfig, Result } from "../../types";
import type { GetProviderKycResponse } from "./providerKycTypes";

const URL = "https://api.monime.io/v1/provider-kyc";

export async function getProviderKyc(
	providerId: string,
	config: ClientConfig,
): Promise<Result<GetProviderKycResponse>> {
	const { monimeSpaceId, accessToken, monimeVersion } = config;

	try {
		const res = await axios.get(`${URL}/${providerId}`, {
			headers: {
				"Monime-Space-Id": monimeSpaceId,
				Authorization: `Bearer ${accessToken}`,
				...(monimeVersion ? { "Monime-Version": monimeVersion } : {}),
			},
		});
		const response = res.data as { result: GetProviderKycResponse };
		return { success: true, data: response.result };
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Unknown error") };
	}
}

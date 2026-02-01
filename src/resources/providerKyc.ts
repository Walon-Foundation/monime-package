import { HttpClient } from "../http";
import type { Result } from "../types";
import type { GetProviderKycResponse } from "../types/providerKyc";

export class ProviderKycAPI extends HttpClient {
	private readonly path = "/provider-kyc";

	/**
	 * Retrieve provider KYC details.
	 * @param providerId - The unique identifier of the provider.
	 */
	async retrieve(providerId: string): Promise<Result<GetProviderKycResponse>> {
		return this.request<GetProviderKycResponse>({
			method: "GET",
			path: `${this.path}/${providerId}`,
		});
	}
}

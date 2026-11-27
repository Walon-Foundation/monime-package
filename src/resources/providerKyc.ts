import { HttpClient } from "../http";
import type { Result } from "../types";
import type { GetProviderKycResponse } from "../types/providerKyc";

export class ProviderKycAPI extends HttpClient {
	private readonly path = "/provider-kyc";

	/**
	 * Look up who holds an account at a provider.
	 * @param providerId - The provider, e.g. `m17` or `slb001`.
	 * @param accountId - The account at that provider: a phone number for
	 * mobile money, an account number for a bank.
	 */
	async retrieve(
		providerId: string,
		accountId: string,
	): Promise<Result<GetProviderKycResponse>> {
		if (!providerId || providerId.trim() === "") {
			return this.invalid("providerId is required");
		}
		if (!accountId || accountId.trim() === "") {
			return this.invalid("accountId is required");
		}

		return this.request<GetProviderKycResponse>({
			method: "GET",
			path: `${this.path}/${providerId}`,
			query: { accountId },
		});
	}
}

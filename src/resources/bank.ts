import { HttpClient } from "../http";
import type { ListOptions, Result } from "../types";
import type { ListBanksResponse, RetrieveBankResponse } from "../types/bank";

export class BankAPI extends HttpClient {
	private readonly path = "/banks";

	/**
	 * Retrieve a specific bank by provider ID.
	 * @param providerId - The unique identifier of the bank provider.
	 */
	async retrieve(providerId: string): Promise<Result<RetrieveBankResponse>> {
		if (!providerId) return this.invalid("providerId is required");

		return this.request<RetrieveBankResponse>({
			method: "GET",
			path: `${this.path}/${providerId}`,
		});
	}

	/**
	 * List a page of banks operating in a country.
	 * @param country - ISO 3166-1 alpha-2 code, e.g. `SL`. The API requires it.
	 */
	async list(
		country: string,
		options?: ListOptions,
	): Promise<Result<ListBanksResponse>> {
		if (!country || country.trim() === "") {
			return this.invalid("country is required, e.g. SL");
		}

		return this.request<ListBanksResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, { country }),
		});
	}
}

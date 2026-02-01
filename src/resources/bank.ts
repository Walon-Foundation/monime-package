import { HttpClient } from "../http";
import type { Result } from "../types";
import type { ListBanksResponse, RetrieveBankResponse } from "../types/bank";

export class BankAPI extends HttpClient {
	private readonly path = "/banks";

	/**
	 * Retrieve a specific bank by provider ID.
	 * @param providerId - The unique identifier of the bank provider.
	 */
	async retrieve(providerId: string): Promise<Result<RetrieveBankResponse>> {
		return this.request<RetrieveBankResponse>({
			method: "GET",
			path: `${this.path}/${providerId}`,
		});
	}

	/**
	 * List all banks.
	 */
	async list(): Promise<Result<ListBanksResponse>> {
		return this.request<ListBanksResponse>({
			method: "GET",
			path: this.path,
		});
	}
}

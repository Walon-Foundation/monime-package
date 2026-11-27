import { HttpClient } from "../http";
import type { ListOptions, Result } from "../types";
import type { ListMomosResponse, RetrieveMomoResponse } from "../types/momo";

export class MomoAPI extends HttpClient {
	private readonly path = "/momos";

	/**
	 * Retrieve a specific mobile money provider by ID.
	 * @param providerId - The unique identifier of the MoMo provider.
	 */
	async retrieve(providerId: string): Promise<Result<RetrieveMomoResponse>> {
		if (!providerId) return this.invalid("providerId is required");

		return this.request<RetrieveMomoResponse>({
			method: "GET",
			path: `${this.path}/${providerId}`,
		});
	}

	/**
	 * List a page of mobile money providers operating in a country.
	 * @param country - ISO 3166-1 alpha-2 code, e.g. `SL`. The API requires it.
	 */
	async list(
		country: string,
		options?: ListOptions,
	): Promise<Result<ListMomosResponse>> {
		if (!country || country.trim() === "") {
			return this.invalid("country is required, e.g. SL");
		}

		return this.request<ListMomosResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, { country }),
		});
	}
}

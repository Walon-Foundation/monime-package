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
		return this.request<RetrieveMomoResponse>({
			method: "GET",
			path: `${this.path}/${providerId}`,
		});
	}

	/**
	 * List a page of mobile money providers.
	 */
	async list(options?: ListOptions): Promise<Result<ListMomosResponse>> {
		return this.request<ListMomosResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options),
		});
	}
}

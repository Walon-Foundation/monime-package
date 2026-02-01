import { HttpClient } from "../http";
import type { Result } from "../types";
import type { RetrieveMomoResponse, ListMomosResponse } from "../types/momo";

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
	 * List all mobile money providers.
	 */
	async list(): Promise<Result<ListMomosResponse>> {
		return this.request<ListMomosResponse>({
			method: "GET",
			path: this.path,
		});
	}
}

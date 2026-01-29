import type { ClientConfig, Result } from "../../../types";
import { getMomo, listMomos } from "./momo";
import type { GetMomoResponse, ListMomosResponse } from "./momoTypes";

export function MomoAPI(config: ClientConfig) {
	return {
		get: (providerId: string) =>
			getMomo(providerId, config) as Promise<Result<GetMomoResponse>>,
		getAll: (params?: Record<string, unknown>) =>
			listMomos(config, params) as Promise<Result<ListMomosResponse>>,
	};
}

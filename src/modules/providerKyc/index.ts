import type { ClientConfig, Result } from "../../types";
import { getProviderKyc } from "./providerKyc";
import type { GetProviderKycResponse } from "./providerKycTypes";

export function ProviderKycAPI(config: ClientConfig) {
	return {
		get: (providerId: string) =>
			getProviderKyc(providerId, config) as Promise<
				Result<GetProviderKycResponse>
			>,
	};
}

import type { ClientConfig } from "../../types";
import { getProviderKyc } from "./providerKyc";

export function ProviderKycAPI(config: ClientConfig) {
	return {
		get: (providerId: string) => getProviderKyc(providerId, config),
	};
}

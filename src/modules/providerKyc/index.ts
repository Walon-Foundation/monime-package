import type { MonimeClient } from "../../client";
import { getProviderKyc } from "./providerKyc";

export function ProviderKycAPI(client: MonimeClient) {
	return {
		get: (providerId: string) => getProviderKyc(providerId, client),
	};
}

import type { ClientConfig, Result } from "../../../types";
import { getBank, listBanks } from "./bank";
import type { GetBankResponse, ListBanksResponse } from "./bankTypes";

export function BankAPI(config: ClientConfig) {
	return {
		get: (providerId: string) =>
			getBank(providerId, config) as Promise<Result<GetBankResponse>>,
		getAll: (params?: Record<string, unknown>) =>
			listBanks(config, params) as Promise<Result<ListBanksResponse>>,
	};
}

import type { ClientConfig, Result } from "../../types";
import type {
	AllFinancialAccount,
	CreateFinancialAccount,
	GetFinancialAccount,
} from "../types";
import {
	type Currency,
	createFinancialAccount,
	getAllFinancialAccount,
	getFinancialAccount,
} from "./financialAccount";

export function FinancialAccountAPI(config: ClientConfig) {
	return {
		create: (name: string, currency: Currency) =>
			createFinancialAccount(name, currency, config) as Promise<
				Result<CreateFinancialAccount>
			>,
		get: (financialAccountId: string) =>
			getFinancialAccount(financialAccountId, config) as Promise<
				Result<GetFinancialAccount>
			>,
		getAll: () =>
			getAllFinancialAccount(config) as Promise<Result<AllFinancialAccount>>,
	};
}

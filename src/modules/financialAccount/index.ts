import type { ClientConfig } from "../../types";
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
			createFinancialAccount(name, currency, config) as Promise<{
				success: boolean;
				data?: CreateFinancialAccount;
				error?: Error;
			}>,
		get: (financialAccountId: string) =>
			getFinancialAccount(financialAccountId, config) as Promise<{
				success: boolean;
				data?: GetFinancialAccount;
				error?: Error;
			}>,
		getAll: () =>
			getAllFinancialAccount(config) as Promise<{
				success: boolean;
				data?: AllFinancialAccount;
				error?: Error;
			}>,
	};
}

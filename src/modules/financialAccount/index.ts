import type { MonimeClient } from "../../client";
import type {
	AllFinancialAccount,
	CreateFinancialAccount,
	GetFinancialAccount,
} from "../types";
import {
	createFinancialAccount,
	getAllFinancialAccount,
	getFinancialAccount,
} from "./financialAccount";

export function FinancialAccountAPI(client: MonimeClient) {
	return {
		create: (name: string) =>
			createFinancialAccount(name, client) as Promise<{
				success: boolean;
				data?: CreateFinancialAccount;
				error?: Error;
			}>,
		get: (financialAccountId: string) =>
			getFinancialAccount(financialAccountId, client) as Promise<{
				success: boolean;
				data?: GetFinancialAccount;
				error?: Error;
			}>,
		getAll: () =>
			getAllFinancialAccount(client) as Promise<{
				success: boolean;
				data?: AllFinancialAccount;
				error?: Error;
			}>,
	};
}

import type { ClientConfig } from "../../types";
import { getAllTransaction, getTransaction } from "./financialTransaction";
import type {
	AllTransaction,
	GetTransaction,
} from "./financialTransactionTypes";

export function FinancialTransactionAPI(config: ClientConfig) {
	return {
		get: (transactionId: string) =>
			getTransaction(config, transactionId) as Promise<{
				success: boolean;
				error?: Error;
				data?: GetTransaction;
			}>,

		getAll: () =>
			getAllTransaction(config) as Promise<{
				success: boolean;
				error?: Error;
				data?: AllTransaction;
			}>,
	};
}

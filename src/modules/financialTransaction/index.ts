import type { MonimeClient } from "../../client";
import { getAllTransaction, getTransaction } from "./financialTransaction";
import type {
	AllTransaction,
	GetTransaction,
} from "./financialTransactionTypes";

export function FinancialTransactionAPI(client: MonimeClient) {
	return {
		get: (transactionId: string) =>
			getTransaction(client, transactionId) as Promise<{
				success: boolean;
				error?: Error;
				data?: GetTransaction;
			}>,

		getAll: () =>
			getAllTransaction(client) as Promise<{
				success: boolean;
				error?: Error;
				data?: AllTransaction;
			}>,
	};
}

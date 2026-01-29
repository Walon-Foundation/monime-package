import type { ClientConfig, Result } from "../../types";
import { getAllTransaction, getTransaction } from "./financialTransaction";
import type {
	AllTransaction,
	GetTransaction,
} from "./financialTransactionTypes";

export function FinancialTransactionAPI(config: ClientConfig) {
	return {
		get: (transactionId: string) =>
			getTransaction(config, transactionId) as Promise<Result<GetTransaction>>,

		getAll: () => getAllTransaction(config) as Promise<Result<AllTransaction>>,
	};
}

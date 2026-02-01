import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	ListTransactionsResponse,
	RetrieveTransactionResponse,
} from "../types/financialTransaction";

export class FinancialTransactionAPI extends HttpClient {
	private readonly path = "/financial-transactions";

	/**
	 * List all financial transactions.
	 */
	async list(): Promise<Result<ListTransactionsResponse>> {
		return this.request<ListTransactionsResponse>({
			method: "GET",
			path: this.path,
		});
	}

	/**
	 * Retrieve a specific transaction by ID.
	 * @param transactionId - The unique identifier of the transaction.
	 */
	async retrieve(
		transactionId: string,
	): Promise<Result<RetrieveTransactionResponse>> {
		if (!transactionId || transactionId.trim() === "") {
			return {
				error: new Error("transactionId is required"),
				success: false,
			};
		}

		return this.request<RetrieveTransactionResponse>({
			method: "GET",
			path: `${this.path}/${transactionId}`,
		});
	}
}

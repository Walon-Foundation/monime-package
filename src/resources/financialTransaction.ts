import { HttpClient } from "../http";
import type { ListOptions, Result } from "../types";
import type {
	ListTransactionsResponse,
	RetrieveTransactionResponse,
} from "../types/financialTransaction";

export class FinancialTransactionAPI extends HttpClient {
	private readonly path = "/financial-transactions";

	/**
	 * List a page of financial transactions.
	 */
	async list(options?: ListOptions): Promise<Result<ListTransactionsResponse>> {
		return this.request<ListTransactionsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options),
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

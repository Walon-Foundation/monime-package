import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	ListFinancialTransactionsOptions,
	ListTransactionsResponse,
	RetrieveTransactionResponse,
} from "../types/financialTransaction";

export class FinancialTransactionAPI extends HttpClient {
	private readonly path = "/financial-transactions";

	/**
	 * List a page of ledger entries, optionally for one account or type. The
	 * API has no date filter: page through with the cursor.
	 */
	async list(
		options: ListFinancialTransactionsOptions = {},
	): Promise<Result<ListTransactionsResponse>> {
		if (options.type && options.type !== "credit" && options.type !== "debit") {
			return this.invalid("type must be credit or debit");
		}

		return this.request<ListTransactionsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, {
				financialAccountId: options.financialAccountId,
				reference: options.reference,
				type: options.type,
			}),
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
			return this.invalid("transactionId is required");
		}

		return this.request<RetrieveTransactionResponse>({
			method: "GET",
			path: `${this.path}/${transactionId}`,
		});
	}
}

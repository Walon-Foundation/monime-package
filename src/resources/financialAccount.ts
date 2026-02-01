import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	ListFinancialAccountsResponse,
	CreateFinancialAccountResponse,
	RetrieveFinancialAccountResponse,
} from "../types/financialAccount";
import { createFinancialAccountSchema } from "../validators/financialAccount.validator";
import { randomBytes } from "node:crypto";

export type Currency = "USD" | "SLE";

export class FinancialAccountAPI extends HttpClient {
	private readonly path = "/financial-accounts";

	/**
	 * Create a new financial account.
	 * @param accountName - The name of the account.
	 * @param currency - The currency (USD or SLE).
	 */
	async create(
		accountName: string,
		currency: Currency,
	): Promise<Result<CreateFinancialAccountResponse>> {
		const validation = createFinancialAccountSchema.safeParse({
			accountName,
			currency,
		});

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const body = {
			name: accountName,
			currency: currency,
			description: "",
			metadata: {},
		};

		const idempotencyKey = randomBytes(20).toString("hex");

		return this.request<CreateFinancialAccountResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey,
		});
	}

	/**
	 * Retrieve a specific financial account by ID.
	 * @param financialAccountId - The unique identifier of the account.
	 */
	async retrieve(financialAccountId: string): Promise<Result<RetrieveFinancialAccountResponse>> {
		if (!financialAccountId || financialAccountId.trim() === "") {
			return {
				success: false,
				error: new Error("financialAccountId is required"),
			};
		}

		return this.request<RetrieveFinancialAccountResponse>({
			method: "GET",
			path: `${this.path}/${financialAccountId}`,
		});
	}

	/**
	 * List all financial accounts.
	 */
	async list(): Promise<Result<ListFinancialAccountsResponse>> {
		return this.request<ListFinancialAccountsResponse>({
			method: "GET",
			path: this.path,
		});
	}
}

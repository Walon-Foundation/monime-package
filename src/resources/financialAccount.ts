import { randomBytes } from "node:crypto";
import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	CreateFinancialAccountResponse,
	ListFinancialAccountsResponse,
	RetrieveFinancialAccountResponse,
} from "../types/financialAccount";
import { createFinancialAccountSchema } from "../validators/financialAccount.validator";

export type Currency = "USD" | "SLE";

export interface CreateFinancialAccountOptions {
	accountName: string;
	currency: Currency;
	description?: string;
	metadata?: Record<string, unknown>;
}

export class FinancialAccountAPI extends HttpClient {
	private readonly path = "/financial-accounts";

	/**
	 * Create a new financial account.
	 */
	async create(
		options: CreateFinancialAccountOptions,
	): Promise<Result<CreateFinancialAccountResponse>> {
		const validation = createFinancialAccountSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const body = {
			name: options.accountName,
			currency: options.currency,
			description: options.description || "",
			metadata: options.metadata || {},
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
	async retrieve(
		financialAccountId: string,
	): Promise<Result<RetrieveFinancialAccountResponse>> {
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

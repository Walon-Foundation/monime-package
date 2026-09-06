import { HttpClient } from "../http";
import type { ListOptions, MutationOptions, Result } from "../types";
import type {
	CreateFinancialAccountResponse,
	ListFinancialAccountsResponse,
	RetrieveFinancialAccountResponse,
	UpdateFinancialAccountResponse,
} from "../types/financialAccount";
import {
	createFinancialAccountSchema,
	patchFinancialAccountSchema,
} from "../validators/financialAccount.validator";

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
		requestOptions?: MutationOptions,
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

		const idempotencyKey = this.idempotencyKey(requestOptions);

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
	 * List a page of financial accounts.
	 */
	async list(
		options?: ListOptions,
	): Promise<Result<ListFinancialAccountsResponse>> {
		return this.request<ListFinancialAccountsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options),
		});
	}

	/**
	 * Update an existing financial account.
	 * @param financialAccountId - The unique identifier of the account.
	 * @param body - The partial financial account data to update.
	 */
	async update(
		financialAccountId: string,
		body: Record<string, unknown>,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdateFinancialAccountResponse>> {
		if (!financialAccountId) {
			return {
				success: false,
				error: new Error("financialAccountId is required"),
			};
		}

		const validation = patchFinancialAccountSchema.safeParse(body);
		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<UpdateFinancialAccountResponse>({
			method: "PATCH",
			path: `${this.path}/${financialAccountId}`,
			body,
			idempotencyKey,
		});
	}
}

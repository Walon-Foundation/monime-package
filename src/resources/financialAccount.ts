import { HttpClient } from "../http";
import type { MutationOptions, Result } from "../types";
import type {
	CreateFinancialAccountOptions,
	CreateFinancialAccountResponse,
	ListFinancialAccountsOptions,
	ListFinancialAccountsResponse,
	RetrieveFinancialAccountOptions,
	RetrieveFinancialAccountResponse,
	UpdateFinancialAccountOptions,
	UpdateFinancialAccountResponse,
} from "../types/financialAccount";
import { compact } from "../validators/common";
import {
	createFinancialAccountSchema,
	patchFinancialAccountSchema,
} from "../validators/financialAccount.validator";

export type {
	CreateFinancialAccountOptions,
	RetrieveFinancialAccountOptions,
	UpdateFinancialAccountOptions,
} from "../types/financialAccount";

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
		if (!validation.success) return this.invalid(validation.error);

		const body = compact({
			name: options.accountName,
			currency: options.currency,
			reference: options.reference,
			description: options.description,
			metadata: options.metadata,
		});

		return this.request<CreateFinancialAccountResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}

	/**
	 * Retrieve a specific financial account by ID.
	 * @param financialAccountId - The unique identifier of the account.
	 * @param options - Pass `{ withBalance: true }` to include the balance.
	 */
	async retrieve(
		financialAccountId: string,
		options: RetrieveFinancialAccountOptions = {},
	): Promise<Result<RetrieveFinancialAccountResponse>> {
		if (!financialAccountId || financialAccountId.trim() === "") {
			return this.invalid("financialAccountId is required");
		}

		return this.request<RetrieveFinancialAccountResponse>({
			method: "GET",
			path: `${this.path}/${financialAccountId}`,
			query: { withBalance: options.withBalance },
		});
	}

	/**
	 * List a page of financial accounts, optionally filtered.
	 */
	async list(
		options: ListFinancialAccountsOptions = {},
	): Promise<Result<ListFinancialAccountsResponse>> {
		return this.request<ListFinancialAccountsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, {
				uvan: options.uvan,
				reference: options.reference,
				withBalance: options.withBalance,
			}),
		});
	}

	/**
	 * Update an existing financial account.
	 * @param financialAccountId - The unique identifier of the account.
	 * @param body - The fields to change; `null` clears a field.
	 */
	async update(
		financialAccountId: string,
		body: UpdateFinancialAccountOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdateFinancialAccountResponse>> {
		if (!financialAccountId) {
			return this.invalid("financialAccountId is required");
		}

		const validation = patchFinancialAccountSchema.safeParse(body);
		if (!validation.success) return this.invalid(validation.error);

		return this.request<UpdateFinancialAccountResponse>({
			method: "PATCH",
			path: `${this.path}/${financialAccountId}`,
			body,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}
}

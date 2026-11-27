import { HttpClient } from "../http";
import type { MutationOptions, Result } from "../types";
import type {
	CreatePayoutOptions,
	CreatePayoutResponse,
	ListPayoutsOptions,
	ListPayoutsResponse,
	RetrievePayoutResponse,
	UpdatePayoutOptions,
	UpdatePayoutResponse,
} from "../types/payout";
import { compact } from "../validators/common";
import {
	createPayoutSchema,
	listPayoutsSchema,
	patchPayoutSchema,
} from "../validators/payout.validator";

export type { CreatePayoutOptions } from "../types/payout";

export class PayoutAPI extends HttpClient {
	private readonly path = "/payouts";

	/**
	 * Create a new payout. Pass an `idempotencyKey` you can reuse on retry, or
	 * a timeout followed by a retry can pay twice.
	 */
	async create(
		options: CreatePayoutOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<CreatePayoutResponse>> {
		const validation = createPayoutSchema.safeParse(options);
		if (!validation.success) return this.invalid(validation.error);

		const body = compact({
			amount: {
				currency: options.currency ?? "SLE",
				value: options.amount,
			},
			source: options.sourceAccount
				? { financialAccountId: options.sourceAccount }
				: undefined,
			destination: options.destination,
			metadata: options.metadata,
		});

		return this.request<CreatePayoutResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}

	/**
	 * List a page of payouts, optionally filtered.
	 */
	async list(
		options: ListPayoutsOptions = {},
	): Promise<Result<ListPayoutsResponse>> {
		const validation = listPayoutsSchema.safeParse(options);
		if (!validation.success) return this.invalid(validation.error);

		return this.request<ListPayoutsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, {
				status: options.status,
				sourceFinancialAccountId: options.sourceFinancialAccountId,
				sourceTransactionReference: options.sourceTransactionReference,
				destinationTransactionReference:
					options.destinationTransactionReference,
			}),
		});
	}

	/**
	 * Retrieve a specific payout by ID.
	 * @param payoutId - The unique identifier of the payout.
	 */
	async retrieve(payoutId: string): Promise<Result<RetrievePayoutResponse>> {
		if (!payoutId) return this.invalid("payoutId is required");

		return this.request<RetrievePayoutResponse>({
			method: "GET",
			path: `${this.path}/${payoutId}`,
		});
	}

	/**
	 * Update a payout's metadata, before it is processed.
	 * @param payoutId - The unique identifier of the payout.
	 * @param body - `{ metadata }`; `null` or `""` deletes a key.
	 */
	async update(
		payoutId: string,
		body: UpdatePayoutOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdatePayoutResponse>> {
		if (!payoutId) return this.invalid("payoutId is required");

		const validation = patchPayoutSchema.safeParse(body);
		if (!validation.success) return this.invalid(validation.error);

		return this.request<UpdatePayoutResponse>({
			method: "PATCH",
			path: `${this.path}/${payoutId}`,
			body,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}

	/**
	 * Cancel a payout that has not started processing.
	 * @param payoutId - The unique identifier of the payout.
	 */
	async delete(payoutId: string): Promise<Result<void>> {
		if (!payoutId) return this.invalid("payoutId is required");

		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${payoutId}`,
		});
	}
}

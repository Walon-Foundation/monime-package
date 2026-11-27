import { HttpClient } from "../http";
import type { MutationOptions, Result } from "../types";
import type {
	CreateInternalTransferOptions,
	CreateInternalTransferResponse,
	ListInternalTransfersOptions,
	ListInternalTransfersResponse,
	RetrieveInternalTransferResponse,
	UpdateInternalTransferOptions,
	UpdateInternalTransferResponse,
} from "../types/internalTransfer";
import { compact } from "../validators/common";
import {
	createInternalTransferSchema,
	listInternalTransfersSchema,
	patchInternalTransferSchema,
} from "../validators/internalTransfer.validator";

export type { CreateInternalTransferOptions } from "../types/internalTransfer";

export class InternalTransferAPI extends HttpClient {
	private readonly path = "/internal-transfers";

	/**
	 * Create a new internal transfer between financial accounts.
	 */
	async create(
		options: CreateInternalTransferOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<CreateInternalTransferResponse>> {
		const validation = createInternalTransferSchema.safeParse(options);
		if (!validation.success) return this.invalid(validation.error);

		const body = compact({
			amount: {
				currency: options.currency ?? "SLE",
				value: options.amount,
			},
			sourceFinancialAccount: { id: options.sourceAccount },
			destinationFinancialAccount: { id: options.destinationAccount },
			description: options.description || undefined,
			metadata: options.metadata,
		});

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<CreateInternalTransferResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey,
		});
	}

	/**
	 * List a page of internal transfers, optionally filtered.
	 */
	async list(
		options: ListInternalTransfersOptions = {},
	): Promise<Result<ListInternalTransfersResponse>> {
		const validation = listInternalTransfersSchema.safeParse(options);
		if (!validation.success) return this.invalid(validation.error);

		return this.request<ListInternalTransfersResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, {
				status: options.status,
				sourceFinancialAccountId: options.sourceFinancialAccountId,
				destinationFinancialAccountId: options.destinationFinancialAccountId,
				financialTransactionReference: options.financialTransactionReference,
			}),
		});
	}

	/**
	 * Retrieve a specific internal transfer by ID.
	 * @param internalTransferId - The unique identifier of the transfer.
	 */
	async retrieve(
		internalTransferId: string,
	): Promise<Result<RetrieveInternalTransferResponse>> {
		if (!internalTransferId) {
			return this.invalid("internalTransferId is required");
		}

		return this.request<RetrieveInternalTransferResponse>({
			method: "GET",
			path: `${this.path}/${internalTransferId}`,
		});
	}

	/**
	 * Update an existing internal transfer.
	 * @param internalTransferId - The unique identifier of the transfer.
	 * @param body - `{ description?, metadata? }`; `null` clears a field.
	 */
	async update(
		internalTransferId: string,
		body: UpdateInternalTransferOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdateInternalTransferResponse>> {
		if (!internalTransferId) {
			return this.invalid("internalTransferId is required");
		}

		const validation = patchInternalTransferSchema.safeParse(body);
		if (!validation.success) return this.invalid(validation.error);

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<UpdateInternalTransferResponse>({
			method: "PATCH",
			path: `${this.path}/${internalTransferId}`,
			body,
			idempotencyKey,
		});
	}

	/**
	 * Delete or cancel an internal transfer.
	 * @param internalTransferId - The unique identifier of the transfer.
	 */
	async delete(internalTransferId: string): Promise<Result<void>> {
		if (!internalTransferId) {
			return this.invalid("internalTransferId is required");
		}

		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${internalTransferId}`,
		});
	}
}

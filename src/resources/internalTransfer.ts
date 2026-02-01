import { randomBytes } from "node:crypto";
import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	CreateInternalTransferResponse,
	ListInternalTransfersResponse,
	RetrieveInternalTransferResponse,
} from "../types/internalTransfer";
import { createInternalTransferSchema } from "../validators/internalTransfer.validator";

export interface CreateInternalTransferOptions {
	sourceAccount: string;
	destinationAccount: string;
	amount: number;
	description?: string;
	metadata?: Record<string, unknown>;
}

export class InternalTransferAPI extends HttpClient {
	private readonly path = "/internal-transfers";

	/**
	 * Create a new internal transfer between financial accounts.
	 */
	async create(
		options: CreateInternalTransferOptions,
	): Promise<Result<CreateInternalTransferResponse>> {
		const validation = createInternalTransferSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const body = {
			amount: {
				currency: "SLE",
				value: options.amount,
			},
			sourceFinancialAccount: {
				id: options.sourceAccount,
			},
			destinationFinancialAccount: {
				id: options.destinationAccount,
			},
			description: options.description || "",
			metadata: options.metadata || {},
		};

		const idempotencyKey = randomBytes(20).toString("hex");

		return this.request<CreateInternalTransferResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey,
		});
	}

	/**
	 * List all internal transfers.
	 */
	async list(): Promise<Result<ListInternalTransfersResponse>> {
		return this.request<ListInternalTransfersResponse>({
			method: "GET",
			path: this.path,
		});
	}

	/**
	 * Retrieve a specific internal transfer by ID.
	 * @param internalTransferId - The unique identifier of the transfer.
	 */
	async retrieve(
		internalTransferId: string,
	): Promise<Result<RetrieveInternalTransferResponse>> {
		return this.request<RetrieveInternalTransferResponse>({
			method: "GET",
			path: `${this.path}/${internalTransferId}`,
		});
	}

	/**
	 * Delete or cancel an internal transfer.
	 * @param internalTransferId - The unique identifier of the transfer.
	 */
	async delete(internalTransferId: string): Promise<Result<void>> {
		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${internalTransferId}`,
		});
	}
}

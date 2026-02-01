import { HttpClient } from "../http";
import type { Result } from "../types";
import { createInternalTransferSchema } from "../validators/internalTransfer.validator";
import type {
	ListInternalTransfersResponse,
	CreateInternalTransferResponse,
	RetrieveInternalTransferResponse,
} from "../types/internalTransfer";
import { randomBytes } from "node:crypto";

export class InternalTransferAPI extends HttpClient {
	private readonly path = "/internal-transfers";

	/**
	 * Create a new internal transfer between financial accounts.
	 * @param sourceAccount - The source account ID.
	 * @param destinationAccount - The destination account ID.
	 * @param amount - The amount to transfer in SLE.
	 */
	async create(
		sourceAccount: string,
		destinationAccount: string,
		amount: number,
	): Promise<Result<CreateInternalTransferResponse>> {
		const validation = createInternalTransferSchema.safeParse({
			sourceAccount,
			destinationAccount,
			amount,
		});

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const body = {
			amount: {
				currency: "SLE",
				value: amount,
			},
			sourceFinancialAccount: {
				id: sourceAccount,
			},
			destinationFinancialAccount: {
				id: destinationAccount,
			},
			metadata: {},
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
	async retrieve(internalTransferId: string): Promise<Result<RetrieveInternalTransferResponse>> {
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

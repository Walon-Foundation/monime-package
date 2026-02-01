import { randomBytes } from "node:crypto";
import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	CreatePayoutResponse,
	DestinationOption,
	ListPayoutsResponse,
	RetrievePayoutResponse,
} from "../types/payout";
import { createPayoutSchema } from "../validators/payout.validator";

export interface CreatePayoutOptions {
	amount: number;
	sourceAccount: string;
	destination: DestinationOption;
	metadata?: Record<string, unknown>;
}

export class PayoutAPI extends HttpClient {
	private readonly path = "/payouts";

	/**
	 * Create a new payout.
	 */
	async create(
		options: CreatePayoutOptions,
	): Promise<Result<CreatePayoutResponse>> {
		const validation = createPayoutSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const body = {
			amount: {
				currency: "SLE",
				value: options.amount,
			},
			source: {
				financialAccountId: options.sourceAccount,
			},
			destination: options.destination,
			metadata: options.metadata || {},
		};

		const idempotencyKey = randomBytes(20).toString("hex");

		return this.request<CreatePayoutResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey,
		});
	}

	/**
	 * List all payouts.
	 */
	async list(): Promise<Result<ListPayoutsResponse>> {
		return this.request<ListPayoutsResponse>({
			method: "GET",
			path: this.path,
		});
	}

	/**
	 * Retrieve a specific payout by ID.
	 * @param payoutId - The unique identifier of the payout.
	 */
	async retrieve(payoutId: string): Promise<Result<RetrievePayoutResponse>> {
		return this.request<RetrievePayoutResponse>({
			method: "GET",
			path: `${this.path}/${payoutId}`,
		});
	}

	/**
	 * Delete or cancel a payout.
	 * @param payoutId - The unique identifier of the payout.
	 */
	async delete(payoutId: string): Promise<Result<void>> {
		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${payoutId}`,
		});
	}
}

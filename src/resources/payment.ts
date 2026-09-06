import { HttpClient } from "../http";
import type { ListOptions, MutationOptions, Result } from "../types";
import type {
	ListPaymentsResponse,
	RetrievePaymentResponse,
	UpdatePaymentResponse,
} from "../types/payment";
import { patchPaymentSchema } from "../validators/payment.validator";

export class PaymentAPI extends HttpClient {
	private readonly path = "/payments";

	/**
	 * Retrieve a specific payment by ID.
	 * @param paymentId - The unique identifier of the payment.
	 */
	async retrieve(paymentId: string): Promise<Result<RetrievePaymentResponse>> {
		if (!paymentId) {
			return { success: false, error: new Error("paymentId is required") };
		}

		return this.request<RetrievePaymentResponse>({
			method: "GET",
			path: `${this.path}/${paymentId}`,
		});
	}

	/**
	 * List a page of payments.
	 */
	async list(options?: ListOptions): Promise<Result<ListPaymentsResponse>> {
		return this.request<ListPaymentsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options),
		});
	}

	/**
	 * Update an existing payment.
	 * @param paymentId - The unique identifier of the payment.
	 * @param body - The partial payment data to update.
	 */
	async update(
		paymentId: string,
		body: Record<string, unknown>,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdatePaymentResponse>> {
		if (!paymentId) {
			return { success: false, error: new Error("paymentId is required") };
		}

		const validation = patchPaymentSchema.safeParse(body);
		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<UpdatePaymentResponse>({
			method: "PATCH",
			path: `${this.path}/${paymentId}`,
			body,
			idempotencyKey,
		});
	}
}

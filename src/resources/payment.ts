import { HttpClient } from "../http";
import type { MutationOptions, Result } from "../types";
import type {
	ListPaymentsOptions,
	ListPaymentsResponse,
	RetrievePaymentResponse,
	UpdatePaymentOptions,
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
		if (!paymentId) return this.invalid("paymentId is required");

		return this.request<RetrievePaymentResponse>({
			method: "GET",
			path: `${this.path}/${paymentId}`,
		});
	}

	/**
	 * List a page of payments, optionally filtered.
	 */
	async list(
		options: ListPaymentsOptions = {},
	): Promise<Result<ListPaymentsResponse>> {
		return this.request<ListPaymentsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, {
				orderNumber: options.orderNumber,
				financialAccountId: options.financialAccountId,
				financialTransactionReference: options.financialTransactionReference,
			}),
		});
	}

	/**
	 * Update an existing payment.
	 * @param paymentId - The unique identifier of the payment.
	 * @param body - `{ name?, metadata? }`; `null` clears a field.
	 */
	async update(
		paymentId: string,
		body: UpdatePaymentOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdatePaymentResponse>> {
		if (!paymentId) return this.invalid("paymentId is required");

		const validation = patchPaymentSchema.safeParse(body);
		if (!validation.success) return this.invalid(validation.error);

		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<UpdatePaymentResponse>({
			method: "PATCH",
			path: `${this.path}/${paymentId}`,
			body,
			idempotencyKey,
		});
	}
}

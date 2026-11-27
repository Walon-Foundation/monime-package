import { HttpClient } from "../http";
import type { AmountInput, MutationOptions, Result } from "../types";
import type {
	CreatePaymentCodeOptions,
	CreatePaymentCodeResponse,
	ListPaymentCodesOptions,
	ListPaymentCodesResponse,
	PaymentCodeRecurrentTargetInput,
	RetrievePaymentCodeResponse,
	UpdatePaymentCodeOptions,
	UpdatePaymentCodeResponse,
} from "../types/paymentCode";
import { compact } from "../validators/common";
import {
	createPaymentCodeSchema,
	listPaymentCodesSchema,
	patchPaymentCodeSchema,
} from "../validators/paymentCode.validator";

export type { CreatePaymentCodeOptions } from "../types/paymentCode";

function amount(input: AmountInput) {
	return { currency: input.currency ?? "SLE", value: input.value };
}

function target(input: PaymentCodeRecurrentTargetInput) {
	return compact({
		expectedPaymentCount: input.expectedPaymentCount,
		expectedPaymentTotal: input.expectedPaymentTotal
			? amount(input.expectedPaymentTotal)
			: undefined,
	});
}

export class PaymentCodeAPI extends HttpClient {
	private readonly path = "/payment-codes";

	/**
	 * Create a new USSD payment code. `amount` is in minor units and is sent as
	 * given: `{ value: 1050 }` asks for SLE 10.50.
	 */
	async create(
		options: CreatePaymentCodeOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<CreatePaymentCodeResponse>> {
		const validation = createPaymentCodeSchema.safeParse(options);
		if (!validation.success) return this.invalid(validation.error);

		const body = compact({
			...options,
			amount: options.amount ? amount(options.amount) : undefined,
			recurrentPaymentTarget: options.recurrentPaymentTarget
				? target(options.recurrentPaymentTarget)
				: undefined,
		});

		return this.request<CreatePaymentCodeResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}

	/**
	 * Retrieve a specific payment code by ID.
	 * @param paymentCodeId - The unique identifier of the payment code.
	 */
	async retrieve(
		paymentCodeId: string,
	): Promise<Result<RetrievePaymentCodeResponse>> {
		if (!paymentCodeId) return this.invalid("paymentCodeId is required");

		return this.request<RetrievePaymentCodeResponse>({
			method: "GET",
			path: `${this.path}/${paymentCodeId}`,
		});
	}

	/**
	 * List a page of payment codes, optionally filtered.
	 */
	async list(
		options: ListPaymentCodesOptions = {},
	): Promise<Result<ListPaymentCodesResponse>> {
		const validation = listPaymentCodesSchema.safeParse(options);
		if (!validation.success) return this.invalid(validation.error);

		return this.request<ListPaymentCodesResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options, {
				ussd_code: options.ussdCode,
				mode: options.mode,
				status: options.status,
			}),
		});
	}

	/**
	 * Update an existing payment code.
	 * @param paymentCodeId - The unique identifier of the payment code.
	 * @param body - The fields to change; `null` clears a field.
	 */
	async update(
		paymentCodeId: string,
		body: UpdatePaymentCodeOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<UpdatePaymentCodeResponse>> {
		if (!paymentCodeId) {
			return this.invalid("paymentCodeId is required");
		}

		const validation = patchPaymentCodeSchema.safeParse(body);
		if (!validation.success) return this.invalid(validation.error);

		const payload = compact({
			...body,
			amount: body.amount ? amount(body.amount) : body.amount,
			recurrentPaymentTarget: body.recurrentPaymentTarget
				? target(body.recurrentPaymentTarget)
				: body.recurrentPaymentTarget,
		});

		return this.request<UpdatePaymentCodeResponse>({
			method: "PATCH",
			path: `${this.path}/${paymentCodeId}`,
			body: payload,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}

	/**
	 * Delete a payment code.
	 * @param paymentCodeId - The unique identifier of the payment code.
	 */
	async delete(paymentCodeId: string): Promise<Result<void>> {
		if (!paymentCodeId || paymentCodeId.trim() === "") {
			return this.invalid("paymentCodeId is required");
		}

		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${paymentCodeId}`,
		});
	}
}

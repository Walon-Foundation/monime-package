import { HttpClient } from "../http";
import type { Result } from "../types";
import type {
	CreatePaymentCodeResponse,
	ListPaymentCodesResponse,
	RetrievePaymentCodeResponse,
} from "../types/paymentCode";
import { createPaymentCodeSchema } from "../validators/paymentCode.validator";
import { randomBytes } from "node:crypto";

export interface CreatePaymentCodeOptions {
	paymentName: string;
	amount: number;
	financialAccountId: string | null;
	name: string;
	phoneNumber: string;
}

export class PaymentCodeAPI extends HttpClient {
	private readonly path = "/payment-codes";

	/**
	 * Create a new USSD payment code.
	 */
	async create(options: CreatePaymentCodeOptions): Promise<Result<CreatePaymentCodeResponse>> {
		const validation = createPaymentCodeSchema.safeParse(options);

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const bodyData = {
			name: options.paymentName,
			mode: "recurrent",
			enable: true,
			amount: {
				currency: "SLE",
				value: options.amount * 100, // minor units
			},
			duration: "1h30m",
			customer: {
				name: options.name,
			},
			reference: "",
			authorizedPhoneNumber: options.phoneNumber,
			recurrentPaymentTarget: {
				expectedPaymentCount: 1,
				expectedPaymentTotal: {
					currency: "SLE",
					value: options.amount * 100,
				},
			},
			financialAccountId: options.financialAccountId || undefined,
			metadata: {},
		};

		const idempotencyKey = randomBytes(20).toString("hex");

		return this.request<CreatePaymentCodeResponse>({
			method: "POST",
			path: this.path,
			body: bodyData,
			idempotencyKey,
		});
	}

	/**
	 * Retrieve a specific payment code by ID.
	 * @param paymentCodeId - The unique identifier of the payment code.
	 */
	async retrieve(paymentCodeId: string): Promise<Result<RetrievePaymentCodeResponse>> {
		return this.request<RetrievePaymentCodeResponse>({
			method: "GET",
			path: `${this.path}/${paymentCodeId}`,
		});
	}

	/**
	 * List all payment codes.
	 */
	async list(): Promise<Result<ListPaymentCodesResponse>> {
		return this.request<ListPaymentCodesResponse>({
			method: "GET",
			path: this.path,
		});
	}

	/**
	 * Delete a payment code.
	 * @param paymentCodeId - The unique identifier of the payment code.
	 */
	async delete(paymentCodeId: string): Promise<Result<void>> {
		if (!paymentCodeId || paymentCodeId.trim() === "") {
			return { success: false, error: new Error("paymentCodeId is required") };
		}

		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${paymentCodeId}`,
		});
	}
}

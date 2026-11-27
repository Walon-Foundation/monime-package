import { HttpClient } from "../http";
import type { MutationOptions, Result } from "../types";
import type {
	GetReceiptResponse,
	RedeemReceiptOptions,
	RedeemReceiptResponse,
} from "../types/receipt";
import {
	orderNumberSchema,
	redeemReceiptSchema,
} from "../validators/receipt.validator";

export class ReceiptAPI extends HttpClient {
	private readonly path = "/receipts";

	/**
	 * Retrieve a specific receipt by order number.
	 * @param orderNumber - The order number of the receipt (at most 20 characters).
	 */
	async retrieve(orderNumber: string): Promise<Result<GetReceiptResponse>> {
		const check = orderNumberSchema.safeParse(orderNumber);
		if (!check.success) return this.invalid(check.error);

		return this.request<GetReceiptResponse>({
			method: "GET",
			path: `${this.path}/${orderNumber}`,
		});
	}

	/**
	 * Redeem a receipt, in full or by entitlement.
	 * @param orderNumber - The order number of the receipt.
	 * @param body - `{ redeemAll }` or `{ entitlements: [{ key, units }] }`.
	 * @returns `{ redeem, receipt }`: whether it was redeemed, and the receipt.
	 */
	async redeem(
		orderNumber: string,
		body: RedeemReceiptOptions = {},
		requestOptions?: MutationOptions,
	): Promise<Result<RedeemReceiptResponse>> {
		const check = orderNumberSchema.safeParse(orderNumber);
		if (!check.success) return this.invalid(check.error);

		const validation = redeemReceiptSchema.safeParse(body);
		if (!validation.success) return this.invalid(validation.error);

		return this.request<RedeemReceiptResponse>({
			method: "POST",
			path: `${this.path}/${orderNumber}/redeem`,
			body,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}
}

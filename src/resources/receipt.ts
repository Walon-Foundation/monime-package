import { HttpClient } from "../http";
import type { MutationOptions, Result } from "../types";
import type {
	GetReceiptResponse,
	RedeemReceiptResponse,
} from "../types/receipt";

export class ReceiptAPI extends HttpClient {
	private readonly path = "/receipts";

	/**
	 * Retrieve a specific receipt by order number.
	 * @param orderNumber - The order number of the receipt.
	 */
	async retrieve(orderNumber: string): Promise<Result<GetReceiptResponse>> {
		return this.request<GetReceiptResponse>({
			method: "GET",
			path: `${this.path}/${orderNumber}`,
		});
	}

	/**
	 * Redeem a receipt.
	 * @param orderNumber - The order number of the receipt.
	 * @param body - The redemption data.
	 */
	async redeem(
		orderNumber: string,
		body: Record<string, unknown>,
		requestOptions?: MutationOptions,
	): Promise<Result<RedeemReceiptResponse>> {
		const idempotencyKey = this.idempotencyKey(requestOptions);

		return this.request<RedeemReceiptResponse>({
			method: "POST",
			path: `${this.path}/${orderNumber}/redeem`,
			body,
			idempotencyKey,
		});
	}
}

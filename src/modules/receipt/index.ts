import type { ClientConfig, Result } from "../../types";
import { getReceipt, redeemReceipt } from "./receipt";
import type { GetReceiptResponse, RedeemReceiptResponse } from "./receiptTypes";

export function ReceiptAPI(config: ClientConfig) {
	return {
		get: (orderNumber: string) =>
			getReceipt(orderNumber, config) as Promise<Result<GetReceiptResponse>>,
		redeem: (orderNumber: string, body: Record<string, unknown> = {}) =>
			redeemReceipt(orderNumber, body, config) as Promise<
				Result<RedeemReceiptResponse>
			>,
	};
}

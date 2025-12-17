import type { ClientConfig } from "../../types";
import { getReceipt, redeemReceipt } from "./receipt";

export function ReceiptAPI(config: ClientConfig) {
	return {
		get: (orderNumber: string) => getReceipt(orderNumber, config),
		redeem: (orderNumber: string, body: Record<string, unknown> = {}) =>
			redeemReceipt(orderNumber, body, config),
	};
}

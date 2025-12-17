import type { MonimeClient } from "../../client";
import { getReceipt, redeemReceipt } from "./receipt";

export function ReceiptAPI(client: MonimeClient) {
	return {
		get: (orderNumber: string) => getReceipt(orderNumber, client),
		redeem: (orderNumber: string, body: Record<string, any> = {}) =>
			redeemReceipt(orderNumber, body, client),
	};
}

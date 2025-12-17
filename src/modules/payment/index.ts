import type { MonimeClient } from "../../client";
import { getPayment, listPayments, patchPayment } from "./payment";

export function PaymentAPI(client: MonimeClient) {
	return {
		get: (paymentId: string) => getPayment(paymentId, client),
		getAll: (params?: Record<string, any>) => listPayments(client, params),
		patch: (paymentId: string, body: Record<string, any>) =>
			patchPayment(paymentId, body, client),
	};
}

import type { ClientConfig } from "../../types";
import { getPayment, listPayments, patchPayment } from "./payment";

export function PaymentAPI(config: ClientConfig) {
	return {
		get: (paymentId: string) => getPayment(paymentId, config),
		getAll: (params?: Record<string, any>) => listPayments(config, params),
		patch: (paymentId: string, body: Record<string, any>) =>
			patchPayment(paymentId, body, config),
	};
}

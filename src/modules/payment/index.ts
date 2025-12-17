import type { ClientConfig } from "../../types";
import { getPayment, listPayments, patchPayment } from "./payment";

export function PaymentAPI(config: ClientConfig) {
	return {
		get: (paymentId: string) => getPayment(paymentId, config),
		getAll: (params?: Record<string, unknown>) => listPayments(config, params),
		patch: (paymentId: string, body: Record<string, unknown>) =>
			patchPayment(paymentId, body, config),
	};
}

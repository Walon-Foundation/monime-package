import type { ClientConfig, Result } from "../../types";
import { getPayment, listPayments, patchPayment } from "./payment";
import type { GetPayment, ListPayments, PatchPayment } from "./paymentTypes";

export function PaymentAPI(config: ClientConfig) {
	return {
		get: (paymentId: string) =>
			getPayment(paymentId, config) as Promise<Result<GetPayment>>,
		getAll: (params?: Record<string, unknown>) =>
			listPayments(config, params) as Promise<Result<ListPayments>>,
		patch: (paymentId: string, body: Record<string, unknown>) =>
			patchPayment(paymentId, body, config) as Promise<Result<PatchPayment>>,
	};
}

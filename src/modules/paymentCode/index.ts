import type { ClientConfig, Result } from "../../types";
import type { CreatePaymentCode, GetAllPaymentCode, GetOne } from "../types";
import {
	createPaymentCode,
	deletePaymentCode,
	getAllPaymentCode,
	getPaymentCode,
} from "./paymentCode";

export function PaymentCodeAPI(config: ClientConfig) {
	return {
		create: (
			paymentName: string,
			amount: number,
			financialAccount: string,
			username: string,
			phoneNumber: string,
		) =>
			createPaymentCode(
				paymentName,
				amount,
				financialAccount,
				username,
				phoneNumber,
				config,
			) as Promise<Result<CreatePaymentCode>>,

		delete: (paymentCodeId: string) =>
			deletePaymentCode(paymentCodeId, config) as Promise<Result<void>>,

		getAll: () =>
			getAllPaymentCode(config) as Promise<Result<GetAllPaymentCode>>,

		get: (paymentCodeId: string) =>
			getPaymentCode(paymentCodeId, config) as Promise<Result<GetOne>>,
	};
}

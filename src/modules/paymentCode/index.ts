import type { ClientConfig } from "../../types";
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
			) as Promise<{
				success: boolean;
				data?: CreatePaymentCode;
				error?: Error;
			}>,

		delete: (paymentCodeId: string) =>
			deletePaymentCode(paymentCodeId, config) as Promise<{
				success: boolean;
				error?: Error;
			}>,

		getAll: () =>
			getAllPaymentCode(config) as Promise<{
				success: boolean;
				data?: GetAllPaymentCode;
				error?: Error;
			}>,

		get: (paymentCodeId: string) =>
			getPaymentCode(paymentCodeId, config) as Promise<{
				success: boolean;
				data?: GetOne;
				error?: Error;
			}>,
	};
}

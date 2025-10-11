import type { MonimeClient } from "../../client";
import type { CreatePaymentCode } from "../types";
import { createPaymentCode, deletePaymentCode } from "./paymentCode";

export function PaymentCodeAPI(client: MonimeClient) {
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
				client,
			) as Promise<{
				success: boolean;
				data?: CreatePaymentCode;
				error?: Error;
			}>,

		delete: (paymentCodeId: string) =>
			deletePaymentCode(paymentCodeId, client) as Promise<{
				success: boolean;
				data?: CreatePaymentCode;
				error?: Error;
			}>,
	};
}

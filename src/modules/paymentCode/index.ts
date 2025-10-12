import type { MonimeClient } from "../../client";
import type { CreatePaymentCode, DeletePaymentCode, GetAllPaymentCode, GetOne } from "../types";
import { createPaymentCode, deletePaymentCode, getAllPaymentCode, getPaymentCode } from "./paymentCode";

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
				data?: DeletePaymentCode;
				error?: Error;
			}>,

		getAll: () => 
			getAllPaymentCode(client) as Promise<{
				success: boolean;
				data?: GetAllPaymentCode;
				error?: Error;
			}>,

		get: (paymentCodeId:string) => 
			getPaymentCode(paymentCodeId, client) as Promise<{
				success: boolean;
				data?: GetOne;
				error?: Error;
			}>
	};
}

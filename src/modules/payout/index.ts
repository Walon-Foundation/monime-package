import type { MonimeClient } from "../../client";
import type { CreatePayout } from "../types";
import { CreatePayoutMobileMoney } from "./payout";

export function PayoutAPI(client: MonimeClient) {
	return {
		create: (amount: number, phoneNumber: string, sourceAccount: string) =>
			CreatePayoutMobileMoney(
				amount,
				phoneNumber,
				sourceAccount,
				client,
			) as Promise<{
				success: boolean;
				data?: CreatePayout;
				error?: Error;
			}>,
	};
}

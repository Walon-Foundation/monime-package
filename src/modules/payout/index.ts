import type { MonimeClient } from "../../client";
import type {
	CreatePayout,
	DestinationOption,
	GetAll,
	GetOnePayout,
} from "../types";
import { createPayout, deletePayout, getAllPayout, getPayout } from "./payout";

export function PayoutAPI(client: MonimeClient) {
	return {
		create: (
			amount: number,
			destination: DestinationOption,
			sourceAccount: string,
		) =>
			createPayout(amount, sourceAccount, destination, client) as Promise<{
				success: boolean;
				data?: CreatePayout;
				error?: Error;
			}>,

		get: () =>
			getAllPayout(client) as Promise<{
				success: boolean;
				data?: GetAll;
				error?: Error;
			}>,

		getOne: (payoutId: string) =>
			getPayout(payoutId, client) as Promise<{
				success: boolean;
				data?: GetOnePayout;
				error?: Error;
			}>,

		delete: (payoutId: string) =>
			deletePayout(payoutId, client) as Promise<{
				success: boolean;
				error?: Error;
			}>,
	};
}

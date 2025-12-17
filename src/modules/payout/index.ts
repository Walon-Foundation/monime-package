import type { ClientConfig } from "../../types";
import type {
	CreatePayout,
	DestinationOption,
	GetAll,
	GetOnePayout,
} from "../types";
import { createPayout, deletePayout, getAllPayout, getPayout } from "./payout";

export function PayoutAPI(config: ClientConfig) {
	return {
		create: (
			amount: number,
			destination: DestinationOption,
			sourceAccount: string,
		) =>
			createPayout(amount, sourceAccount, destination, config) as Promise<{
				success: boolean;
				data?: CreatePayout;
				error?: Error;
			}>,

		get: () =>
			getAllPayout(config) as Promise<{
				success: boolean;
				data?: GetAll;
				error?: Error;
			}>,

		getOne: (payoutId: string) =>
			getPayout(payoutId, config) as Promise<{
				success: boolean;
				data?: GetOnePayout;
				error?: Error;
			}>,

		delete: (payoutId: string) =>
			deletePayout(payoutId, config) as Promise<{
				success: boolean;
				error?: Error;
			}>,
	};
}

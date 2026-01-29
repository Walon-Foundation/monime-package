import type { ClientConfig, Result } from "../../types";
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
			createPayout(amount, sourceAccount, destination, config) as Promise<
				Result<CreatePayout>
			>,

		get: () => getAllPayout(config) as Promise<Result<GetAll>>,

		getOne: (payoutId: string) =>
			getPayout(payoutId, config) as Promise<Result<GetOnePayout>>,

		delete: (payoutId: string) =>
			deletePayout(payoutId, config) as Promise<Result<void>>,
	};
}

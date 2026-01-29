import type { ClientConfig, Result } from "../../types";
import {
	createInternalTransfer,
	deleteInternalTransfer,
	getAllInternalTransfers,
	getInternalTransfer,
} from "./internalTransfer";
import type {
	AllInternalTransfers,
	CreateInternalTransfer,
	InternalTransfer,
} from "./internalTransferTypes";

export function InternalTransferAPI(config: ClientConfig) {
	return {
		create: (
			sourceAccount: string,
			destinationAccount: string,
			amount: number,
		) =>
			createInternalTransfer(
				sourceAccount,
				destinationAccount,
				config,
				amount,
			) as Promise<Result<CreateInternalTransfer>>,

		get: (internalTransferId: string) =>
			getInternalTransfer(config, internalTransferId) as Promise<
				Result<InternalTransfer>
			>,

		getAll: () =>
			getAllInternalTransfers(config) as Promise<Result<AllInternalTransfers>>,

		delete: (internalTransferId: string) =>
			deleteInternalTransfer(config, internalTransferId) as Promise<Result<void>>,
	};
}

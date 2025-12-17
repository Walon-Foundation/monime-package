import type { ClientConfig } from "../../types";
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
			) as Promise<{
				success: boolean;
				data?: CreateInternalTransfer;
				error?: Error;
			}>,

		get: (internalTransferId: string) =>
			getInternalTransfer(config, internalTransferId) as Promise<{
				success: boolean;
				data?: InternalTransfer;
				error?: Error;
			}>,

		getAll: () =>
			getAllInternalTransfers(config) as Promise<{
				success: boolean;
				error?: Error;
				data?: AllInternalTransfers;
			}>,

		delete: (internalTransferId: string) =>
			deleteInternalTransfer(config, internalTransferId) as Promise<{
				success: boolean;
				error?: Error;
			}>,
	};
}

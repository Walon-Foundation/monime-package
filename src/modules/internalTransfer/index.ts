import type { MonimeClient } from "../../client";
import {
	createInternalTransfer,
	deleteInternalTransfer,
	getAllInternalTransfers,
	getInternalTransfer,
} from "./internalTransfer";
import type {
	AllInternalTransfers,
	CreateInternalTransfer,
	DeleteTransfer,
	InternalTransfer,
} from "./internalTransferTypes";

export async function InternalTransferAPI(client: MonimeClient) {
	return {
		create: (
			sourceAccount: string,
			destinationAccount: string,
			amount: number,
		) =>
			createInternalTransfer(
				sourceAccount,
				destinationAccount,
				client,
				amount,
			) as Promise<{
				success: boolean;
				data?: CreateInternalTransfer;
				error?: Error;
			}>,

		get: (internalTransferId: string) =>
			getInternalTransfer(client, internalTransferId) as Promise<{
				success: boolean;
				data?: InternalTransfer;
				error?: Error;
			}>,

		getAll: () =>
			getAllInternalTransfers(client) as Promise<{
				success: boolean;
				error?: Error;
				data?: AllInternalTransfers;
			}>,

		delete: (internalTransferId: string) =>
			deleteInternalTransfer(client, internalTransferId) as Promise<{
				success: boolean;
				error?: Error;
				data?: DeleteTransfer;
			}>,
	};
}

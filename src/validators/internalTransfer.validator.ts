import { z } from "zod";

export const createInternalTransferSchema = z.object({
	sourceAccount: z.string().min(1, "Source account is required"),
	destinationAccount: z.string().min(1, "Destination account is required"),
	amount: z.number().gt(0, "Amount must be greater than zero"),
});

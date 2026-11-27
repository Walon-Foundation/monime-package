import { z } from "zod";
import { currencySchema, metadataSchema, metadataUpdateSchema } from "./common";

const accountId = (label: string) =>
	z
		.string()
		.min(1, `${label} is required`)
		.max(64, `${label} is at most 64 characters`);

export const createInternalTransferSchema = z
	.object({
		sourceAccount: accountId("Source account"),
		destinationAccount: accountId("Destination account"),
		amount: z
			.number()
			.int("Amount must be a whole number of minor units (e.g. cents)")
			.gt(0, "Amount must be greater than zero"),
		currency: currencySchema.optional(),
		description: z
			.string()
			.max(150, "Description is at most 150 characters")
			.optional(),
		metadata: metadataSchema.optional(),
	})
	.strict();

export const patchInternalTransferSchema = z
	.object({
		description: z
			.string()
			.max(255, "Description is at most 255 characters")
			.nullable()
			.optional(),
		metadata: metadataUpdateSchema.nullable().optional(),
	})
	.strict();

export const listInternalTransfersSchema = z.object({
	status: z.enum(["pending", "processing", "failed", "completed"]).optional(),
});

import { z } from "zod";
import { currencySchema, metadataSchema, metadataUpdateSchema } from "./common";

export const createFinancialAccountSchema = z
	.object({
		accountName: z
			.string()
			.min(1, "Account name is required")
			.max(100, "Account name is at most 100 characters"),
		currency: currencySchema,
		reference: z
			.string()
			.max(64, "Reference is at most 64 characters")
			.optional(),
		description: z
			.string()
			.max(150, "Description is at most 150 characters")
			.optional(),
		metadata: metadataSchema.optional(),
	})
	.strict();

export const patchFinancialAccountSchema = z
	.object({
		name: z
			.string()
			.max(100, "Account name is at most 100 characters")
			.nullable()
			.optional(),
		reference: z
			.string()
			.max(64, "Reference is at most 64 characters")
			.nullable()
			.optional(),
		description: z
			.string()
			.max(150, "Description is at most 150 characters")
			.nullable()
			.optional(),
		metadata: metadataUpdateSchema.nullable().optional(),
	})
	.strict();

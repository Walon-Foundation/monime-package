import { z } from "zod";
import { metadataUpdateSchema } from "./common";

export const patchPaymentSchema = z
	.object({
		name: z
			.string()
			.max(100, "Name is at most 100 characters")
			.nullable()
			.optional(),
		metadata: metadataUpdateSchema.nullable().optional(),
	})
	.strict();

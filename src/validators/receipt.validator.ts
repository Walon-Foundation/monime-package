import { z } from "zod";
import { metadataSchema } from "./common";

export const orderNumberSchema = z
	.string()
	.min(1, "orderNumber is required")
	.max(20, "orderNumber is at most 20 characters");

export const redeemReceiptSchema = z
	.object({
		redeemAll: z.boolean().nullable().optional(),
		entitlements: z
			.array(
				z
					.object({
						key: z
							.string()
							.min(1, "Entitlement key is required")
							.max(100, "Entitlement key is at most 100 characters"),
						units: z
							.number()
							.int()
							.min(1, "units must be at least 1")
							.optional(),
					})
					.strict(),
			)
			.nullable()
			.optional(),
		metadata: metadataSchema.nullable().optional(),
	})
	.strict();

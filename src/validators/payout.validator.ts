import { z } from "zod";
import { currencySchema, metadataSchema, metadataUpdateSchema } from "./common";

const providerId = z.string().min(1, "destination.providerId is required");

export const payoutDestinationSchema = z.discriminatedUnion(
	"type",
	[
		z
			.object({
				type: z.literal("bank"),
				providerId,
				accountNumber: z
					.string()
					.min(1, "destination.accountNumber is required for a bank payout"),
			})
			.strict(),
		z
			.object({
				type: z.literal("momo"),
				providerId,
				phoneNumber: z
					.string()
					.min(1, "destination.phoneNumber is required for a momo payout"),
			})
			.strict(),
		z
			.object({
				type: z.literal("wallet"),
				providerId,
				walletId: z.string().optional(),
			})
			.strict(),
	],
	{ message: "destination.type must be one of bank, momo, wallet" },
);

export const createPayoutSchema = z
	.object({
		amount: z
			.number()
			.int("Amount must be a whole number of minor units (e.g. cents)")
			.gt(0, "Amount must be greater than 0"),
		currency: currencySchema.optional(),
		sourceAccount: z
			.string()
			.min(1, "Source account cannot be empty")
			.optional(),
		destination: payoutDestinationSchema,
		metadata: metadataSchema.optional(),
	})
	.strict();

export const patchPayoutSchema = z
	.object({ metadata: metadataUpdateSchema.nullable().optional() })
	.strict();

export const listPayoutsSchema = z.object({
	status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
});

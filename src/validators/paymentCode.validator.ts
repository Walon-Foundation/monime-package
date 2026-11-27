import { z } from "zod";
import {
	amountInputSchema,
	metadataSchema,
	metadataUpdateSchema,
} from "./common";

const name = z
	.string()
	.min(3, "Payment name must be 3 to 64 characters")
	.max(64, "Payment name must be 3 to 64 characters");
const duration = z.string().min(1, "Duration cannot be empty");
const customer = z
	.object({
		name: z
			.string()
			.max(100, "Customer name is at most 100 characters")
			.nullable()
			.optional(),
	})
	.strict();
const reference = z.string().max(64, "Reference is at most 64 characters");
const authorizedProviders = z
	.array(z.enum(["m17", "m18"]))
	.min(1, "Give at least one authorized provider")
	.max(10, "Give at most 10 authorized providers");
const recurrentPaymentTarget = z
	.object({
		expectedPaymentCount: z
			.number()
			.int()
			.min(1, "expectedPaymentCount must be at least 1")
			.nullable()
			.optional(),
		expectedPaymentTotal: amountInputSchema.optional(),
	})
	.strict();
const financialAccountId = z
	.string()
	.max(64, "financialAccountId is at most 64 characters")
	.regex(/^fac-/, "financialAccountId must start with 'fac-'");

export const createPaymentCodeSchema = z
	.object({
		name,
		mode: z.enum(["one_time", "recurrent"]).optional(),
		enable: z.boolean().optional(),
		amount: amountInputSchema.optional(),
		duration: duration.optional(),
		customer: customer.optional(),
		reference: reference.optional(),
		authorizedProviders: authorizedProviders.optional(),
		authorizedPhoneNumber: z.string().min(1).optional(),
		recurrentPaymentTarget: recurrentPaymentTarget.optional(),
		financialAccountId: financialAccountId.optional(),
		metadata: metadataSchema.optional(),
	})
	.strict();

export const patchPaymentCodeSchema = z
	.object({
		name: name.nullable().optional(),
		amount: amountInputSchema.nullable().optional(),
		duration: duration.nullable().optional(),
		enable: z.boolean().nullable().optional(),
		customer: customer.nullable().optional(),
		reference: reference.nullable().optional(),
		authorizedProviders: authorizedProviders.nullable().optional(),
		authorizedPhoneNumber: z.string().nullable().optional(),
		recurrentPaymentTarget: recurrentPaymentTarget.nullable().optional(),
		financialAccountId: financialAccountId.nullable().optional(),
		metadata: metadataUpdateSchema.nullable().optional(),
	})
	.strict();

export const listPaymentCodesSchema = z.object({
	mode: z.enum(["one_time", "recurrent"]).optional(),
	status: z
		.enum(["pending", "cancelled", "processing", "expired", "completed"])
		.optional(),
});

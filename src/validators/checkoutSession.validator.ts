import { z } from "zod";
import { amountInputSchema, metadataSchema } from "./common";

const url = (label: string) =>
	z
		.string()
		.url(`${label} must be a URL`)
		.max(255, `${label} is at most 255 characters`);

const lineItem = z
	.object({
		type: z.literal("custom").optional(),
		name: z
			.string()
			.min(1, "Line item name is required")
			.max(100, "Line item name is at most 100 characters"),
		price: amountInputSchema,
		quantity: z
			.number()
			.int()
			.min(1, "Quantity must be 1 to 100000")
			.max(100000, "Quantity must be 1 to 100000")
			.optional(),
		reference: z.string().max(100).optional(),
		description: z.string().max(100).optional(),
		images: z.array(z.string()).max(3, "At most 3 images").optional(),
	})
	.strict();

const providerOption = z
	.object({
		disable: z.boolean().optional(),
		enabledProviders: z.array(z.string()).optional(),
		disabledProviders: z.array(z.string()).optional(),
	})
	.strict();

export const createCheckoutSchema = z
	.object({
		name: z
			.string()
			.min(1, "Name is required")
			.max(150, "Name is at most 150 characters"),
		description: z
			.string()
			.max(1000, "Description is at most 1000 characters")
			.optional(),
		cancelUrl: url("cancelUrl").optional(),
		successUrl: url("successUrl").optional(),
		callbackState: z.string().max(255).optional(),
		reference: z.string().max(255).optional(),
		financialAccountId: z.string().max(100).optional(),
		lineItems: z
			.array(lineItem)
			.min(1, "Give 1 to 16 line items")
			.max(16, "Give 1 to 16 line items"),
		paymentOptions: z
			.object({
				card: z.object({ disable: z.boolean().optional() }).strict().optional(),
				bank: providerOption.optional(),
				momo: providerOption.optional(),
				wallet: providerOption.optional(),
			})
			.strict()
			.optional(),
		brandingOptions: z
			.object({ primaryColor: z.string().max(255).optional() })
			.strict()
			.optional(),
		metadata: metadataSchema.optional(),
	})
	.strict();

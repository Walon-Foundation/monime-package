import { z } from "zod";

export const createCheckoutSchema = z.object({
	name: z.string().min(1, "Name is required"),
	amount: z.number().gt(0, "Amount must be greater than zero"),
	quantity: z.number().int().gt(0, "Quantity must be greater than zero"),
	successUrl: z.url("Invalid success URL"),
	cancelUrl: z.url("Invalid cancel URL"),
	description: z.string().optional(),
	financialAccountId: z.string().optional(),
	primaryColor: z.string().optional(),
	images: z.array(z.string()).optional(),
});

import { z } from "zod";

export const createWebhookSchema = z.object({
	name: z.string().min(1, "Name is required"),
	url: z.string().url("Invalid URL"),
	events: z.array(z.string()).min(1, "At least one event is required"),
	enabled: z.boolean().optional(),
	apiRelease: z.string().optional(),
	headers: z.record(z.string(), z.string()).optional(),
	alertEmails: z.array(z.string().email()).optional(),
	verificationMethod: z
		.object({
			type: z.enum(["HS256", "ES256"]),
			secret: z.string(),
		})
		.optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateWebhookSchema = z.object({
	name: z.string().min(1).optional(),
	url: z.string().url().optional(),
	events: z.array(z.string()).min(1).optional(),
	enabled: z.boolean().optional(),
	headers: z.record(z.string(), z.string()).optional(),
	alertEmails: z.array(z.string().email()).optional(),
	verificationMethod: z
		.object({
			type: z.enum(["HS256", "ES256"]),
			secret: z.string(),
		})
		.optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

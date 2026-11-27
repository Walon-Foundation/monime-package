import { z } from "zod";
import { metadataSchema, metadataUpdateSchema } from "./common";

const name = z
	.string()
	.min(1, "Name is required")
	.max(100, "Name is at most 100 characters");
const url = z
	.string()
	.url("Invalid URL")
	.max(255, "URL is at most 255 characters");
const events = z
	.array(z.string().min(1))
	.min(1, "At least one event is required")
	.max(100, "At most 100 events");
const apiRelease = z.enum(["caph", "siriusb"], {
	message: "apiRelease must be caph or siriusb",
});
const headers = z.record(z.string(), z.string());
const alertEmails = z
	.array(z.string().email())
	.max(2, "At most 2 alert emails");

export const createWebhookSchema = z
	.object({
		name,
		url,
		events,
		enabled: z.boolean().optional(),
		apiRelease: apiRelease.optional(),
		headers: headers.optional(),
		alertEmails: alertEmails.optional(),
		verificationMethod: z
			.discriminatedUnion("type", [
				z
					.object({
						type: z.literal("HS256"),
						secret: z
							.string()
							.min(32, "An HS256 secret is 32 to 256 characters")
							.max(256, "An HS256 secret is 32 to 256 characters"),
					})
					.strict(),
				z.object({ type: z.literal("ES256") }).strict(),
			])
			.optional(),
		metadata: metadataSchema.optional(),
	})
	.strict();

export const updateWebhookSchema = z
	.object({
		name: name.nullable().optional(),
		url: url.nullable().optional(),
		enabled: z.boolean().nullable().optional(),
		apiRelease: apiRelease.nullable().optional(),
		events: events.nullable().optional(),
		headers: headers.nullable().optional(),
		alertEmails: alertEmails.nullable().optional(),
		metadata: metadataUpdateSchema.nullable().optional(),
	})
	.strict();

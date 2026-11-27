import { z } from "zod";
import { metadataSchema } from "./common";

export const createUssdOtpSchema = z
	.object({
		authorizedPhoneNumber: z
			.string()
			.min(1, "Authorized phone number is required"),
		verificationMessage: z
			.string()
			.max(255, "Verification message is at most 255 characters")
			.optional(),
		duration: z.string().min(1, "Duration cannot be empty").optional(),
		metadata: metadataSchema.optional(),
	})
	.strict();

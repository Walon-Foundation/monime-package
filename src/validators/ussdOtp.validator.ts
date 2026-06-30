import { z } from "zod";

export const createUssdOtpSchema = z.object({
	authorizedPhoneNumber: z
		.string()
		.min(1, "Authorized phone number is required"),
});

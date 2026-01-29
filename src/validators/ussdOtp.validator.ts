import { z } from "zod";

export const createUssdOtpSchema = z.object({
	phoneNumber: z.string().min(1, "Phone number is required"),
});

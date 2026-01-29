import { describe, expect, it } from "vitest";
import { createUssdOtpSchema } from "../../../src/validators/ussdOtp.validator";

describe("createUssdOtpSchema", () => {
	it("should validate a correct USSD OTP request", () => {
		const result = createUssdOtpSchema.safeParse({
			phoneNumber: "+1234567890",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when phoneNumber is empty", () => {
		const result = createUssdOtpSchema.safeParse({
			phoneNumber: "",
		});
		expect(result.success).toBe(false);
	});
});

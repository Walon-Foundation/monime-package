import { describe, expect, it } from "vitest";
import { createUssdOtpSchema } from "../../../src/validators/ussdOtp.validator";

describe("createUssdOtpSchema", () => {
	it("should validate a correct USSD OTP request", () => {
		const result = createUssdOtpSchema.safeParse({
			authorizedPhoneNumber: "+1234567890",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when authorizedPhoneNumber is empty", () => {
		const result = createUssdOtpSchema.safeParse({
			authorizedPhoneNumber: "",
		});
		expect(result.success).toBe(false);
	});
});

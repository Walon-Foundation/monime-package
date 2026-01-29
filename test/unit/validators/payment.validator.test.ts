import { describe, expect, it } from "vitest";
import { patchPaymentSchema } from "../../../src/validators/payment.validator";

describe("patchPaymentSchema", () => {
	it("should validate a correct patch request", () => {
		const result = patchPaymentSchema.safeParse({
			amount: 500,
			status: "completed",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when input is not an object", () => {
		const result = patchPaymentSchema.safeParse("invalid-string");
		expect(result.success).toBe(false);
	});
});

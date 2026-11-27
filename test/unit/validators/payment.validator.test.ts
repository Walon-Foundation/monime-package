import { describe, expect, it } from "vitest";
import { patchPaymentSchema } from "../../../src/validators/payment.validator";

describe("patchPaymentSchema", () => {
	it("should validate a name and metadata update", () => {
		const result = patchPaymentSchema.safeParse({
			name: "Order 42",
			metadata: { order_id: "42", stale: null },
		});
		expect(result.success).toBe(true);
	});

	it("should fail on fields the API does not accept", () => {
		const result = patchPaymentSchema.safeParse({
			amount: 500,
			status: "completed",
		});
		expect(result.success).toBe(false);
	});

	it("should fail when the name is over 100 characters", () => {
		const result = patchPaymentSchema.safeParse({ name: "x".repeat(101) });
		expect(result.success).toBe(false);
	});

	it("should fail when input is not an object", () => {
		const result = patchPaymentSchema.safeParse("invalid-string");
		expect(result.success).toBe(false);
	});
});

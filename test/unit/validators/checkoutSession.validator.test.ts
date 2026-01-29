import { describe, it, expect } from "vitest";
import { createCheckoutSchema } from "../../../src/validators/checkoutSession.validator";

describe("createCheckoutSchema", () => {
	it("should validate a correct checkout session request", () => {
		const result = createCheckoutSchema.safeParse({
			name: "Product X",
			amount: 1000,
			quantity: 1,
			successUrl: "https://example.com/success",
			cancelUrl: "https://example.com/cancel",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when urls are invalid", () => {
		const result = createCheckoutSchema.safeParse({
			name: "Product X",
			amount: 1000,
			quantity: 1,
			successUrl: "not-a-url",
			cancelUrl: "https://example.com/cancel",
		});
		expect(result.success).toBe(false);
	});

	it("should fail when amount is zero", () => {
		const result = createCheckoutSchema.safeParse({
			name: "Product X",
			amount: 0,
			quantity: 1,
			successUrl: "https://example.com/success",
			cancelUrl: "https://example.com/cancel",
		});
		expect(result.success).toBe(false);
	});
});

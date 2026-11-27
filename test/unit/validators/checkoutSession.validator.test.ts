import { describe, expect, it } from "vitest";
import { createCheckoutSchema } from "../../../src/validators/checkoutSession.validator";

const base = {
	name: "Product X",
	lineItems: [{ name: "Ticket", price: { value: 1000 }, quantity: 1 }],
};

describe("createCheckoutSchema", () => {
	it("should validate a correct checkout session request", () => {
		const result = createCheckoutSchema.safeParse({
			...base,
			successUrl: "https://example.com/success",
			cancelUrl: "https://example.com/cancel",
		});
		expect(result.success).toBe(true);
	});

	it("should validate without redirect URLs, which are optional", () => {
		expect(createCheckoutSchema.safeParse(base).success).toBe(true);
	});

	it("should fail when urls are invalid", () => {
		const result = createCheckoutSchema.safeParse({
			...base,
			successUrl: "not-a-url",
		});
		expect(result.success).toBe(false);
	});

	it("should fail when a price is zero or fractional", () => {
		for (const value of [0, 10.5]) {
			const result = createCheckoutSchema.safeParse({
				name: "Product X",
				lineItems: [{ name: "Ticket", price: { value } }],
			});
			expect(result.success).toBe(false);
		}
	});

	it("should fail when there are no line items", () => {
		const result = createCheckoutSchema.safeParse({ name: "X", lineItems: [] });
		expect(result.success).toBe(false);
	});

	it("should fail on more than 3 images", () => {
		const result = createCheckoutSchema.safeParse({
			name: "X",
			lineItems: [
				{ name: "Item", price: { value: 100 }, images: ["a", "b", "c", "d"] },
			],
		});
		expect(result.success).toBe(false);
	});

	it("should fail on a field the API does not accept", () => {
		const result = createCheckoutSchema.safeParse({ ...base, amount: 1000 });
		expect(result.success).toBe(false);
	});
});

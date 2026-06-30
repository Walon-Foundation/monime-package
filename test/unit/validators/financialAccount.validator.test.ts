import { describe, expect, it } from "vitest";
import {
	createFinancialAccountSchema,
	patchFinancialAccountSchema,
} from "../../../src/validators/financialAccount.validator";

describe("createFinancialAccountSchema", () => {
	it("should validate a correct financial account request", () => {
		const result = createFinancialAccountSchema.safeParse({
			accountName: "My Account",
			currency: "USD",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when accountName is empty", () => {
		const result = createFinancialAccountSchema.safeParse({
			accountName: "",
			currency: "USD",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain(
				"Account name is required",
			);
		}
	});

	it("should fail when currency is invalid", () => {
		const result = createFinancialAccountSchema.safeParse({
			accountName: "My Account",
			currency: "EUR",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain(
				"Currency must be either USD or SLE",
			);
		}
	});
});

describe("patchFinancialAccountSchema", () => {
	it("should validate a correct patch request", () => {
		const result = patchFinancialAccountSchema.safeParse({
			name: "Updated Account",
			description: "new description",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when input is not an object", () => {
		const result = patchFinancialAccountSchema.safeParse("invalid-string");
		expect(result.success).toBe(false);
	});
});

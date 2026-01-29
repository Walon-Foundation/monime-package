import { describe, expect, it } from "vitest";
import { createFinancialAccountSchema } from "../../../src/validators/financialAccount.validator";

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

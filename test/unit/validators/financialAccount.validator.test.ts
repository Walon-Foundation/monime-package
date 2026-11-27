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
			expect(result.error.issues[0]?.message).toContain(
				"Account name is required",
			);
		}
	});

	it("should validate reference, description and metadata", () => {
		const result = createFinancialAccountSchema.safeParse({
			accountName: "Org 7",
			currency: "SLE",
			reference: "org-7",
			description: "Payouts for org 7",
			metadata: { rapporteur_org: "7" },
		});
		expect(result.success).toBe(true);
	});

	it("should fail when description is over 150 characters", () => {
		const result = createFinancialAccountSchema.safeParse({
			accountName: "Org 7",
			currency: "SLE",
			description: "x".repeat(151),
		});
		expect(result.success).toBe(false);
	});

	it("should fail when currency is invalid", () => {
		const result = createFinancialAccountSchema.safeParse({
			accountName: "My Account",
			currency: "EUR",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toContain(
				"Currency must be either SLE or USD",
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

	it("should fail on a field the API does not accept", () => {
		const result = patchFinancialAccountSchema.safeParse({ currency: "SLE" });
		expect(result.success).toBe(false);
	});

	it("should accept null to clear a field", () => {
		const result = patchFinancialAccountSchema.safeParse({
			reference: null,
			metadata: { old_key: null },
		});
		expect(result.success).toBe(true);
	});
});

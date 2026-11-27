import { describe, expect, it } from "vitest";
import {
	createPaymentCodeSchema,
	patchPaymentCodeSchema,
} from "../../../src/validators/paymentCode.validator";

describe("createPaymentCodeSchema", () => {
	it("should validate a correct payment code request", () => {
		const result = createPaymentCodeSchema.safeParse({
			name: "Lunch",
			amount: { currency: "SLE", value: 10000 },
			financialAccountId: "fac-123",
			customer: { name: "John Doe" },
			authorizedPhoneNumber: "+23276123456",
		});
		expect(result.success).toBe(true);
	});

	it("should validate with only a name, as the API allows", () => {
		expect(createPaymentCodeSchema.safeParse({ name: "Lunch" }).success).toBe(
			true,
		);
	});

	it("should fail when the amount is zero, fractional or a bare number", () => {
		for (const amount of [{ value: 0 }, { value: 10.5 }, 100]) {
			const result = createPaymentCodeSchema.safeParse({
				name: "Lunch",
				amount,
			});
			expect(result.success).toBe(false);
		}
	});

	it("should fail when the name is under 3 or over 64 characters", () => {
		expect(createPaymentCodeSchema.safeParse({ name: "ab" }).success).toBe(
			false,
		);
		expect(
			createPaymentCodeSchema.safeParse({ name: "x".repeat(65) }).success,
		).toBe(false);
	});

	it("should fail on an unknown provider or a bad account id", () => {
		expect(
			createPaymentCodeSchema.safeParse({
				name: "Lunch",
				authorizedProviders: ["m99"],
			}).success,
		).toBe(false);
		expect(
			createPaymentCodeSchema.safeParse({
				name: "Lunch",
				financialAccountId: "acc_123",
			}).success,
		).toBe(false);
	});

	it("should fail on the 1.x field names", () => {
		const result = createPaymentCodeSchema.safeParse({
			paymentName: "Lunch",
			name: "John Doe",
			phoneNumber: "+23276123456",
		});
		expect(result.success).toBe(false);
	});
});

describe("patchPaymentCodeSchema", () => {
	it("should accept partial update fields", () => {
		const result = patchPaymentCodeSchema.safeParse({
			name: "Updated Name",
			enable: false,
			reference: null,
		});
		expect(result.success).toBe(true);
	});

	it("should accept an empty object", () => {
		expect(patchPaymentCodeSchema.safeParse({}).success).toBe(true);
	});

	it("should fail on a field the API does not accept", () => {
		expect(
			patchPaymentCodeSchema.safeParse({ status: "expired" }).success,
		).toBe(false);
	});

	it("should fail when given a non-object value", () => {
		expect(patchPaymentCodeSchema.safeParse("not-an-object").success).toBe(
			false,
		);
	});
});

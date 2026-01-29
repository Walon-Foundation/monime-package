import { describe, expect, it } from "vitest";
import { createPaymentCodeSchema } from "../../../src/validators/paymentCode.validator";

describe("createPaymentCodeSchema", () => {
	it("should validate a correct payment code request", () => {
		const result = createPaymentCodeSchema.safeParse({
			paymentName: "Lunch",
			amount: 100,
			financialAccountId: "acc_123",
			name: "John Doe",
			phoneNumber: "+1234567890",
		});
		expect(result.success).toBe(true);
	});

	it("should validate a correct payment code request without financialAccountId", () => {
		const result = createPaymentCodeSchema.safeParse({
			paymentName: "Lunch",
			amount: 100,
			name: "John Doe",
			phoneNumber: "+1234567890",
		});
		expect(result.success).toBe(true);
	});

	it("should fail when amount is zero or negative", () => {
		const result = createPaymentCodeSchema.safeParse({
			paymentName: "Lunch",
			amount: 0,
			name: "John Doe",
			phoneNumber: "+1234567890",
		});
		expect(result.success).toBe(false);
	});

	it("should fail when required fields are missing", () => {
		const result = createPaymentCodeSchema.safeParse({
			paymentName: "",
			amount: 100,
			name: "",
			phoneNumber: "",
		});
		expect(result.success).toBe(false);
	});
});

import { describe, expect, it } from "vitest";
import {
	createPayoutSchema,
	patchPayoutSchema,
} from "../../../src/validators/payout.validator";

describe("createPayoutSchema", () => {
	it("should validate a correct momo payout request", () => {
		const result = createPayoutSchema.safeParse({
			amount: 500,
			sourceAccount: "acc_source",
			destination: {
				type: "momo",
				providerId: "m17",
				phoneNumber: "123456789",
			},
		});
		expect(result.success).toBe(true);
	});

	it("should validate a correct bank payout request", () => {
		const result = createPayoutSchema.safeParse({
			amount: 500,
			sourceAccount: "acc_source",
			destination: {
				type: "bank",
				providerId: "b01",
				accountNumber: "123456789",
			},
		});
		expect(result.success).toBe(true);
	});

	it("should fail when amount is invalid", () => {
		const result = createPayoutSchema.safeParse({
			amount: 0,
			sourceAccount: "acc_source",
			destination: {
				type: "momo",
				providerId: "m17",
				phoneNumber: "123456789",
			},
		});
		expect(result.success).toBe(false);
	});

	it("should fail when destination type is invalid", () => {
		const result = createPayoutSchema.safeParse({
			amount: 500,
			sourceAccount: "acc_source",
			destination: {
				type: "crypto", // Invalid type
				providerId: "m17",
				phoneNumber: "123456789",
			},
		});
		expect(result.success).toBe(false);
	});
});

describe("patchPayoutSchema", () => {
	it("should validate an arbitrary record of update fields", () => {
		const result = patchPayoutSchema.safeParse({
			metadata: { note: "updated" },
			status: "processing",
		});
		expect(result.success).toBe(true);
	});

	it("should validate an empty object", () => {
		const result = patchPayoutSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it("should fail when the body is not an object", () => {
		const result = patchPayoutSchema.safeParse("not-an-object");
		expect(result.success).toBe(false);
	});
});

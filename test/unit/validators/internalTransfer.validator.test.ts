import { describe, expect, it } from "vitest";
import {
	createInternalTransferSchema,
	patchInternalTransferSchema,
} from "../../../src/validators/internalTransfer.validator";

describe("createInternalTransferSchema", () => {
	it("should validate a correct internal transfer request", () => {
		const result = createInternalTransferSchema.safeParse({
			sourceAccount: "acc_source",
			destinationAccount: "acc_dest",
			amount: 50,
		});
		expect(result.success).toBe(true);
	});

	it("should fail when amount is zero", () => {
		const result = createInternalTransferSchema.safeParse({
			sourceAccount: "acc_source",
			destinationAccount: "acc_dest",
			amount: 0,
		});
		expect(result.success).toBe(false);
	});

	it("should fail when sourceAccount is missing", () => {
		const result = createInternalTransferSchema.safeParse({
			sourceAccount: "",
			destinationAccount: "acc_dest",
			amount: 50,
		});
		expect(result.success).toBe(false);
	});
});

describe("patchInternalTransferSchema", () => {
	it("should validate a record of update fields", () => {
		const result = patchInternalTransferSchema.safeParse({
			description: "updated description",
			metadata: { note: "anything" },
		});
		expect(result.success).toBe(true);
	});

	it("should validate an empty object", () => {
		const result = patchInternalTransferSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it("should fail when the body is not an object", () => {
		const result = patchInternalTransferSchema.safeParse("not-an-object");
		expect(result.success).toBe(false);
	});
});

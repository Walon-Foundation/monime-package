import { describe, expect, it } from "vitest";
import {
	amountInputSchema,
	metadataSchema,
	metadataUpdateSchema,
} from "../../../src/validators/common";

describe("metadataSchema", () => {
	it("accepts flat string pairs", () => {
		expect(
			metadataSchema.safeParse({ order_id: "42", "branch-1": "Kenema" })
				.success,
		).toBe(true);
	});

	it("refuses non-string or over-long values", () => {
		expect(metadataSchema.safeParse({ count: 3 }).success).toBe(false);
		expect(metadataSchema.safeParse({ note: "x".repeat(101) }).success).toBe(
			false,
		);
		expect(metadataSchema.safeParse({ nested: { a: "b" } }).success).toBe(
			false,
		);
	});

	it("refuses bad or reserved keys", () => {
		for (const key of [
			"has space",
			"k".repeat(65),
			"_private",
			"-dash",
			"monime_ref",
			"MONIMEx",
		]) {
			expect(metadataSchema.safeParse({ [key]: "v" }).success).toBe(false);
		}
	});

	it("refuses more than 64 pairs", () => {
		const record = Object.fromEntries(
			Array.from({ length: 65 }, (_, i) => [`k${i}`, "v"]),
		);
		expect(metadataSchema.safeParse(record).success).toBe(false);
	});

	it("refuses null values on create but allows them on update", () => {
		expect(metadataSchema.safeParse({ old: null }).success).toBe(false);
		expect(
			metadataUpdateSchema.safeParse({ old: null, gone: "" }).success,
		).toBe(true);
	});
});

describe("amountInputSchema", () => {
	it("accepts whole minor units in SLE or USD", () => {
		expect(amountInputSchema.safeParse({ value: 1050 }).success).toBe(true);
		expect(
			amountInputSchema.safeParse({ currency: "USD", value: 1 }).success,
		).toBe(true);
	});

	it("refuses fractions, zero and other currencies", () => {
		expect(amountInputSchema.safeParse({ value: 10.5 }).success).toBe(false);
		expect(amountInputSchema.safeParse({ value: 0 }).success).toBe(false);
		expect(
			amountInputSchema.safeParse({ currency: "EUR", value: 100 }).success,
		).toBe(false);
	});
});

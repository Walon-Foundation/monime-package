import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("PaymentCode Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: create payment code", async () => {
		const mockData = { result: { id: "pc_1", ussdCode: "*123#" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.paymentCode.create({
			paymentName: "Test Payment",
			amount: 100,
			financialAccountId: "fa_1",
			name: "John Doe",
			phoneNumber: "000000",
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: validation error for empty name", async () => {
		const result = await client.paymentCode.create({
			paymentName: "",
			amount: 100,
			financialAccountId: "fa_1",
			name: "John",
			phoneNumber: "000",
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Payment name is required");
	});

	it("should unknown: handle network timeout", async () => {
		fetchMock.mockRejectedValueOnce(new Error("Timeout"));

		const result = await client.paymentCode.list();
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("Timeout");
	});
});

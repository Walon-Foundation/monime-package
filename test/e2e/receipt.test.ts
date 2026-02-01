import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("Receipt Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: retrieve receipt", async () => {
		const mockData = { result: { orderNumber: "ORD_1", total: 100 } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.receipt.retrieve("ORD_1");
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: 400 on redeem with missing data", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({ message: "Incomplete data" }),
		});

		const result = await client.receipt.redeem("ORD_1", {});
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(400);
	});

	it("should unknown: handle server returning 500 without json", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: async () => { throw new Error("Server error"); }
		});

		const result = await client.receipt.retrieve("ORD_1");
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Request failed with status 500");
	});
});

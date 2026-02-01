import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("InternalTransfer Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: create internal transfer", async () => {
		const mockData = { result: { id: "tr_123", status: "completed" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.internalTransfer.create({
			sourceAccount: "src_1",
			destinationAccount: "dest_1",
			amount: 500
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: validation error for negative amount", async () => {
		const result = await client.internalTransfer.create({
			sourceAccount: "src_1",
			destinationAccount: "dest_1",
			amount: -10
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Amount must be greater than zero");
	});

	it("should unknown: handle 504 Gateway Timeout", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 504,
			json: async () => ({ message: "Gateway Timeout" }),
		});

		const result = await client.internalTransfer.list();
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(504);
	});
});

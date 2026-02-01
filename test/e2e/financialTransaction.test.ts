import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("FinancialTransaction Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: list transactions", async () => {
		const mockData = { result: [{ id: "tx_123", amount: { value: 500 } }] };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.financialTransaction.list();
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: retrieve non-existent transaction", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 404,
			json: async () => ({ message: "Transaction not found" }),
		});

		const result = await client.financialTransaction.retrieve("invalid_id");
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(404);
	});

	it("should unknown: handle empty body with 200 OK", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({}), // Missing result key
		});

		const result = await client.financialTransaction.list();
		expect(result.success).toBe(true);
		expect(result.data).toEqual({});
	});
});

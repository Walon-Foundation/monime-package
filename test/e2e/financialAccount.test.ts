import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("FinancialAccount Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: create financial account", async () => {
		const mockData = { result: { id: "fa_123", name: "Test Account" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.financialAccount.create({
			accountName: "Test Account",
			currency: "SLE",
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should success: retrieve financial account", async () => {
		const mockData = {
			result: { id: "fa_123", balance: { available: { value: 100 } } },
		};
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.financialAccount.retrieve("fa_123");
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: 403 Forbidden", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 403,
			json: async () => ({ message: "Forbidden access" }),
		});

		const result = await client.financialAccount.list();
		expect(result.success).toBe(false);
		expect(result.error).toBeInstanceOf(MonimeError);
		expect((result.error as MonimeError).status).toBe(403);
	});

	it("should unknown: handle 500 server error with HTML", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 500,
			text: async () => "<html>Internal Server Error</html>",
			json: async () => {
				throw new Error("Not JSON");
			},
		});

		const result = await client.financialAccount.retrieve("fa_123");
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Request failed with status 500");
	});
});

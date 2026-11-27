import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("Bank Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		fetchMock.mockReset();
	});

	it("should fail: list without a country never reaches the API", async () => {
		const result = await client.financialProvider.bank.list("");
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("country is required");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should success: list sends the required country", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ result: [], pagination: { count: 0, next: null } }),
		});

		await client.financialProvider.bank.list("SL", { limit: 5 });
		const url = new URL(fetchMock.mock.calls[0]?.[0] as string);
		expect(url.pathname).toBe("/v1/banks");
		expect(url.searchParams.get("country")).toBe("SL");
		expect(url.searchParams.get("limit")).toBe("5");
	});

	it("should success: list banks", async () => {
		const mockData = { result: [{ providerId: "b01", name: "Bank 1" }] };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.financialProvider.bank.list("SL");
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: retrieve bank with 404", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 404,
			json: async () => ({ message: "Bank not found" }),
			headers: new Headers({ "x-request-id": "req-123" }),
		});

		const result = await client.financialProvider.bank.retrieve("non-existent");
		expect(result.success).toBe(false);
		expect(result.error).toBeInstanceOf(MonimeError);
		expect((result.error as MonimeError).status).toBe(404);
	});

	it("should unknown: handle non-json response", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => {
				throw new Error("Invalid JSON");
			},
		});

		const result = await client.financialProvider.bank.list("SL");
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Invalid JSON");
	});
});

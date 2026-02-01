import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("Momo Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: list momos", async () => {
		const mockData = { result: [{ providerId: "m17", name: "Orange Money" }] };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.financialProvider.momo.list();
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: 401 Unauthorized", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 401,
			json: async () => ({ message: "Unauthorized" }),
		});

		const result = await client.financialProvider.momo.retrieve("m17");
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(401);
	});

	it("should unknown: handle malformed JSON error", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => { throw new TypeError("Unexpected end of JSON input"); }
		});

		const result = await client.financialProvider.momo.list();
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Unexpected end of JSON input");
	});
});

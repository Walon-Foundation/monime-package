import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("ProviderKyc Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: retrieve provider KYC", async () => {
		const mockData = { result: { providerId: "p1", kycLevel: "full" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.providerKyc.retrieve("p1");
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: 404 on unknown provider", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 404,
			json: async () => ({ message: "Provider not found" }),
		});

		const result = await client.providerKyc.retrieve("unknown");
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(404);
	});

	it("should unknown: handle error during fetch", async () => {
		fetchMock.mockRejectedValueOnce(new Error("DNS Resolution failed"));

		const result = await client.providerKyc.retrieve("p1");
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("DNS Resolution failed");
	});
});

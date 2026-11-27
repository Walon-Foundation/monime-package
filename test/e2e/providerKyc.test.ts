import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";
import type { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("ProviderKyc Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		fetchMock.mockReset();
	});

	it("should success: retrieve provider KYC with the required accountId", async () => {
		const mockData = {
			result: {
				account: {
					id: "+23276123456",
					name: "Orange Money",
					holderName: "Aminata Kamara",
					metadata: null,
				},
				provider: { id: "m17", type: "momo", name: "Orange Money" },
			},
		};
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.providerKyc.retrieve("m17", "+23276123456");
		expect(result.success).toBe(true);
		expect(result.data?.account.holderName).toBe("Aminata Kamara");

		const url = new URL(fetchMock.mock.calls[0]?.[0] as string);
		expect(url.pathname).toBe("/v1/provider-kyc/m17");
		expect(url.searchParams.get("accountId")).toBe("+23276123456");
	});

	it("should fail: accountId is required", async () => {
		const result = await client.providerKyc.retrieve("m17", "");
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("accountId is required");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should fail: 404 on unknown provider", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 404,
			json: async () => ({ message: "Provider not found" }),
		});

		const result = await client.providerKyc.retrieve("unknown", "123");
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(404);
	});

	it("should unknown: handle error during fetch", async () => {
		fetchMock.mockRejectedValueOnce(new Error("DNS Resolution failed"));

		const result = await client.providerKyc.retrieve("m17", "123");
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("DNS Resolution failed");
	});
});

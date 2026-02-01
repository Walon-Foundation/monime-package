import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("CheckoutSession Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: create checkout session", async () => {
		const mockData = { result: { id: "cs_123", redirectUrl: "https://checkout.com" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.checkoutSession.create({
			name: "Test Product",
			amount: 100,
			quantity: 1,
			successUrl: "https://success.com",
			cancelUrl: "https://cancel.com"
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: validation error (handled by SDK before fetch)", async () => {
		const result = await client.checkoutSession.create({
			name: "", // Invalid name
			amount: -10, // Invalid amount
			quantity: 0, // Invalid quantity
			successUrl: "not-a-url",
			cancelUrl: "not-a-url"
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toBeDefined();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should unknown: handle network error", async () => {
		fetchMock.mockRejectedValueOnce(new Error("Network connection lost"));

		const result = await client.checkoutSession.list();
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("Network connection lost");
	});
});

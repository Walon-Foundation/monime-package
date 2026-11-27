import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function ok(body: unknown) {
	return { ok: true, status: 200, json: async () => body };
}

function sentBody(): Record<string, any> {
	const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
	return JSON.parse(init.body as string);
}

describe("CheckoutSession Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		fetchMock.mockReset();
	});

	it("should success: create checkout session", async () => {
		const mockData = {
			result: { id: "cs_123", redirectUrl: "https://checkout.com" },
		};
		fetchMock.mockResolvedValueOnce(ok(mockData));

		const result = await client.checkoutSession.create({
			name: "Test Product",
			lineItems: [{ name: "Ticket", price: { value: 10000 }, quantity: 2 }],
			successUrl: "https://success.com",
			cancelUrl: "https://cancel.com",
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should success: send only what was set, with prices as given", async () => {
		fetchMock.mockResolvedValueOnce(ok({ result: { id: "cs_1" } }));

		await client.checkoutSession.create({
			name: "Order 42",
			lineItems: [
				{ name: "Ticket", price: { value: 1050 } },
				{
					name: "Dinner",
					price: { currency: "USD", value: 2500 },
					quantity: 3,
				},
			],
			reference: "order-42",
			metadata: { order_id: "42" },
		});

		const body = sentBody();
		expect(body).toEqual({
			name: "Order 42",
			lineItems: [
				{
					name: "Ticket",
					type: "custom",
					price: { currency: "SLE", value: 1050 },
				},
				{
					name: "Dinner",
					type: "custom",
					price: { currency: "USD", value: 2500 },
					quantity: 3,
				},
			],
			reference: "order-42",
			metadata: { order_id: "42" },
		});
		expect(body).not.toHaveProperty("financialAccountId");
		expect(body).not.toHaveProperty("paymentOptions");
	});

	it("should success: pass payment and branding options through", async () => {
		fetchMock.mockResolvedValueOnce(ok({ result: { id: "cs_1" } }));

		await client.checkoutSession.create({
			name: "Order",
			lineItems: [{ name: "Item", price: { value: 100 } }],
			financialAccountId: "fac-123",
			paymentOptions: {
				card: { disable: true },
				momo: { enabledProviders: ["m17"] },
			},
			brandingOptions: { primaryColor: "#13503F" },
		});

		const body = sentBody();
		expect(body.financialAccountId).toBe("fac-123");
		expect(body.paymentOptions).toEqual({
			card: { disable: true },
			momo: { enabledProviders: ["m17"] },
		});
		expect(body.brandingOptions).toEqual({ primaryColor: "#13503F" });
	});

	it("should fail: validation error (handled by SDK before fetch)", async () => {
		const result = await client.checkoutSession.create({
			name: "",
			lineItems: [],
			successUrl: "not-a-url",
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toBeDefined();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should fail: more than 16 line items", async () => {
		const result = await client.checkoutSession.create({
			name: "Order",
			lineItems: Array.from({ length: 17 }, () => ({
				name: "Item",
				price: { value: 100 },
			})),
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("1 to 16 line items");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should unknown: handle network error", async () => {
		fetchMock.mockRejectedValueOnce(new Error("Network connection lost"));

		const result = await client.checkoutSession.list();
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("Network connection lost");
	});
});

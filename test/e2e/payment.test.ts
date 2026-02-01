import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("Payment Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: retrieve payment", async () => {
		const mockData = { result: { id: "pay_1", status: "completed" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.payment.retrieve("pay_1");
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: update payment with invalid data", async () => {
		const result = await client.payment.update("pay_1", { invalid_key: "value" });
		expect(result.success).toBe(false);
		expect(result.error?.message).toBeDefined();
	});

	it("should unknown: handle 502 Bad Gateway", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 502,
			json: async () => ({ message: "Bad Gateway" }),
		});

		const result = await client.payment.list();
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(502);
	});
});

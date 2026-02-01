import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("Payout Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: list payouts", async () => {
		const mockData = { result: [{ id: "po_1", status: "processing" }] };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.payout.list();
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: 400 Bad Request on create", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({ message: "Insufficient funds" }),
		});

		const result = await client.payout.create(1000, "fa_1", { type: "momo", providerId: "m17", phoneNumber: "000" });
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(400);
	});

	it("should unknown: handle 503 Service Unavailable", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 503,
			json: async () => ({ message: "Service Unavailable" }),
		});

		const result = await client.payout.retrieve("po_1");
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(503);
	});
});

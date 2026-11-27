import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("PaymentCode Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		fetchMock.mockReset();
	});

	it("should success: create payment code", async () => {
		const mockData = { result: { id: "pc_1", ussdCode: "*123#" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.paymentCode.create({
			name: "Test Payment",
			amount: { value: 10000 },
			financialAccountId: "fac-1",
			customer: { name: "John Doe" },
			authorizedPhoneNumber: "+23276000000",
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should success: send the amount in minor units and only what was set", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ result: { id: "pmc-1" } }),
		});

		await client.paymentCode.create({
			name: "Meter top-up",
			amount: { value: 1050 },
		});

		const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
		expect(JSON.parse(init.body as string)).toEqual({
			name: "Meter top-up",
			amount: { currency: "SLE", value: 1050 },
		});
	});

	it("should success: send a recurrent target when asked", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ result: { id: "pmc-1" } }),
		});

		await client.paymentCode.create({
			name: "Osusu",
			mode: "recurrent",
			duration: "24h",
			authorizedProviders: ["m17", "m18"],
			recurrentPaymentTarget: {
				expectedPaymentCount: 4,
				expectedPaymentTotal: { value: 400000 },
			},
			reference: "osusu-1",
			metadata: { group: "kenema-1" },
		});

		const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
		expect(JSON.parse(init.body as string)).toEqual({
			name: "Osusu",
			mode: "recurrent",
			duration: "24h",
			authorizedProviders: ["m17", "m18"],
			recurrentPaymentTarget: {
				expectedPaymentCount: 4,
				expectedPaymentTotal: { currency: "SLE", value: 400000 },
			},
			reference: "osusu-1",
			metadata: { group: "kenema-1" },
		});
	});

	it("should fail: an amount given as a bare number is refused", async () => {
		const result = await client.paymentCode.create({
			name: "Old style",
			// The 1.x shape: whole leones as a number. It must not be sent.
			amount: 100 as unknown as { value: number },
		});
		expect(result.success).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should fail: validation error for a short name", async () => {
		const result = await client.paymentCode.create({ name: "ab" });
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain(
			"Payment name must be 3 to 64 characters",
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should success: update payment code", async () => {
		const mockData = { result: { id: "pc_1", name: "Updated Name" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.paymentCode.update("pc_1", {
			name: "Updated Name",
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: update without payment code id", async () => {
		const result = await client.paymentCode.update("", { name: "Updated" });
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("paymentCodeId is required");
	});

	it("should unknown: handle network timeout", async () => {
		fetchMock.mockRejectedValueOnce(new Error("Timeout"));

		const result = await client.paymentCode.list();
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("Timeout");
	});
});

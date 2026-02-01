import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("UssdOtp Resource E2E", () => {
	const client = new MonimeClient({ monimeSpaceId: "test", accessToken: "test" });

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: create USSD OTP", async () => {
		const mockData = { result: { id: "otp_1", code: "123456" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.ussdOtp.create({ phoneNumber: "000", amount: 100 });
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: validation error for missing phone", async () => {
		const result = await client.ussdOtp.create({ phoneNumber: "", amount: 100 });
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Phone number is required");
	});

	it("should unknown: handle 502 error", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 502,
			json: async () => ({ message: "Bad Gateway" }),
		});

		const result = await client.ussdOtp.create({ phoneNumber: "000", amount: 100 });
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(502);
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";
import type { MonimeError } from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("UssdOtp Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: create USSD OTP", async () => {
		const mockData = { result: { id: "otp_1", status: "pending" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.ussdOtp.create({
			authorizedPhoneNumber: "076000000",
		});
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: validation error for missing authorized phone", async () => {
		const result = await client.ussdOtp.create({
			authorizedPhoneNumber: "",
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain(
			"Authorized phone number is required",
		);
	});

	it("should success: retrieve USSD OTP", async () => {
		const mockData = { result: { id: "otp_1", status: "pending" } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.ussdOtp.retrieve("otp_1");
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: retrieve with empty id", async () => {
		const result = await client.ussdOtp.retrieve("");
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("ussdOtpId is required");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should success: list USSD OTPs", async () => {
		const mockData = {
			result: [{ id: "otp_1", status: "pending" }],
			pagination: { count: 1, next: "" },
		};
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.ussdOtp.list();
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should success: delete USSD OTP", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 204,
			json: async () => ({}),
		});

		const result = await client.ussdOtp.delete("otp_1");
		expect(result.success).toBe(true);
	});

	it("should fail: delete with empty id", async () => {
		const result = await client.ussdOtp.delete("");
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("ussdOtpId is required");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("should unknown: handle 502 error", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 502,
			json: async () => ({ message: "Bad Gateway" }),
		});

		const result = await client.ussdOtp.create({
			authorizedPhoneNumber: "076000000",
		});
		expect(result.success).toBe(false);
		expect((result.error as MonimeError).status).toBe(502);
	});
});

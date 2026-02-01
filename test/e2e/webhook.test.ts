import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("Webhook Resource E2E", () => {
	const client = new MonimeClient({
		monimeSpaceId: "test",
		accessToken: "test",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should success: list webhooks", async () => {
		const mockData = { result: [{ id: "wh_1", url: "https://hook.com" }] };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockData,
		});

		const result = await client.webhook.list();
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData.result);
	});

	it("should fail: create webhook with invalid URL", async () => {
		const result = await client.webhook.create({
			name: "Test",
			url: "not-a-url",
			events: ["payment.completed"],
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("Invalid URL");
	});

	it("should unknown: handle network error on delete", async () => {
		fetchMock.mockRejectedValueOnce(new Error("Connection reset"));

		const result = await client.webhook.delete("wh_1");
		expect(result.success).toBe(false);
		expect(result.error?.message).toBe("Connection reset");
	});
});

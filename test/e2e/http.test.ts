import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";
import {
	MonimeAuthenticationError,
	MonimeConflictError,
	type MonimeError,
	MonimeRateLimitError,
} from "../../src/error";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

/** Build a Response-like stub with real Headers so lookups are case-insensitive. */
function respond(
	status: number,
	body: unknown,
	headers: Record<string, string> = {},
) {
	return {
		ok: status >= 200 && status < 300,
		status,
		headers: new Headers(headers),
		json: async () => body,
	};
}

describe("HttpClient transport", () => {
	const client = new MonimeClient({
		monimeSpaceId: "spc-test",
		accessToken: "mon_test_token",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("error envelope", () => {
		it("should success: surface the message from the error envelope", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(400, {
					success: false,
					messages: [],
					error: {
						code: 400,
						reason: "invalid_request",
						message: "The amount must be greater than zero",
						details: [],
					},
				}),
			);

			const result = await client.payout.list();

			expect(result.success).toBe(false);
			expect(result.error?.message).toBe(
				"The amount must be greater than zero",
			);
			expect((result.error as MonimeError).reason).toBe("invalid_request");
			expect((result.error as MonimeError).status).toBe(400);
		});

		it("should success: fall back to the status when the body is not JSON", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 502,
				headers: new Headers(),
				json: async () => {
					throw new Error("not json");
				},
			});

			const result = await client.payout.list();

			expect(result.success).toBe(false);
			expect(result.error?.message).toBe("Request failed with status 502");
		});

		it("should success: read the request id from Monime-Request-Id", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(
					500,
					{ error: { message: "Internal error" } },
					{ "Monime-Request-Id": "req-abc123" },
				),
			);

			const result = await client.payout.list();

			expect((result.error as MonimeError).requestId).toBe("req-abc123");
		});
	});

	describe("error types by status", () => {
		it("should success: map 401 to MonimeAuthenticationError", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(401, { error: { message: "Bad token" } }),
			);

			const result = await client.payout.list();
			expect(result.error).toBeInstanceOf(MonimeAuthenticationError);
		});

		it("should success: map 409 to MonimeConflictError with the reason", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(409, {
					error: {
						reason: "idempotency_key_in_use",
						message: "Key reused with a different request",
					},
				}),
			);

			const result = await client.payout.list();

			expect(result.error).toBeInstanceOf(MonimeConflictError);
			expect((result.error as MonimeError).reason).toBe(
				"idempotency_key_in_use",
			);
		});

		it("should success: map 429 to MonimeRateLimitError with retry metadata", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(
					429,
					{
						success: false,
						messages: [],
						error: {
							code: 429,
							reason: "too_many_requests",
							message: "Request blocked due to rate limiting",
							details: [],
						},
					},
					{ "Retry-After": "12", "Monime-Rate-Limit": "space-limit" },
				),
			);

			const result = await client.payout.list();
			const error = result.error as MonimeRateLimitError;

			expect(error).toBeInstanceOf(MonimeRateLimitError);
			expect(error.retryAfter).toBe(12);
			expect(error.limit).toBe("space-limit");
			expect(error.status).toBe(429);
		});

		it("should success: omit retryAfter when Retry-After is absent", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(429, { error: { message: "Slow down" } }),
			);

			const error = (await client.payout.list()).error as MonimeRateLimitError;
			expect(error.retryAfter).toBeUndefined();
		});
	});

	describe("pagination", () => {
		it("should success: send limit and after as query parameters", async () => {
			fetchMock.mockResolvedValueOnce(respond(200, { result: [] }));

			await client.payout.list({ limit: 25, after: "pyt-cursor" });

			const url = fetchMock.mock.calls[0]?.[0] as string;
			expect(url).toBe(
				"https://api.monime.io/v1/payouts?limit=25&after=pyt-cursor",
			);
		});

		it("should success: omit the query string when no options are given", async () => {
			fetchMock.mockResolvedValueOnce(respond(200, { result: [] }));

			await client.payout.list();

			expect(fetchMock.mock.calls[0]?.[0]).toBe(
				"https://api.monime.io/v1/payouts",
			);
		});

		it("should success: expose the pagination envelope on the result", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(200, {
					success: true,
					messages: [],
					result: [{ id: "pyt-1" }],
					pagination: { count: 1, next: "pyt-next-cursor" },
				}),
			);

			const result = await client.payout.list({ limit: 1 });

			expect(result.data).toEqual([{ id: "pyt-1" }]);
			expect(result.pagination).toEqual({ count: 1, next: "pyt-next-cursor" });
		});

		it("should success: leave pagination undefined on non-list responses", async () => {
			fetchMock.mockResolvedValueOnce(
				respond(200, { result: { id: "pyt-1" } }),
			);

			const result = await client.payout.retrieve("pyt-1");
			expect(result.pagination).toBeUndefined();
		});
	});

	describe("idempotency", () => {
		function sentKey() {
			const init = fetchMock.mock.calls[0]?.[1] as { headers: Headers };
			return init.headers.get("Idempotency-Key");
		}

		it("should success: send a caller-supplied idempotency key", async () => {
			fetchMock.mockResolvedValueOnce(respond(200, { result: {} }));

			await client.payout.create(
				{
					amount: 1000,
					sourceAccount: "fac-1",
					destination: {
						type: "momo",
						providerId: "m17",
						phoneNumber: "078000111",
					},
				},
				{ idempotencyKey: "payout-12345" },
			);

			expect(sentKey()).toBe("payout-12345");
		});

		it("should success: generate a key when the caller omits one", async () => {
			fetchMock.mockResolvedValueOnce(respond(200, { result: {} }));

			await client.payout.create({
				amount: 1000,
				sourceAccount: "fac-1",
				destination: {
					type: "momo",
					providerId: "m17",
					phoneNumber: "078000111",
				},
			});

			const key = sentKey();
			expect(key).toMatch(/^[0-9a-f]{40}$/);
			// The API caps the header at 64 characters.
			expect((key as string).length).toBeLessThanOrEqual(64);
		});
	});
});

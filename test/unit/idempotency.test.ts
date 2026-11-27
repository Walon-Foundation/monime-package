import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";
import { MonimeValidationError } from "../../src/error";
import {
	IDEMPOTENCY_NAMESPACE,
	idempotencyKeyFor,
} from "../../src/idempotency";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function ok() {
	return { ok: true, status: 200, json: async () => ({ result: { id: "x" } }) };
}

function header(name: string): string | null {
	const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
	return (init.headers as Headers).get(name);
}

const transfer = {
	sourceAccount: "fac-a",
	destinationAccount: "fac-b",
	amount: 100,
};

describe("idempotencyKeyFor", () => {
	it("derives the shared UUIDv5 vectors (same as the Go SDK)", () => {
		expect(IDEMPOTENCY_NAMESPACE).toBe("324f9f23-0e7a-54ba-9149-8240b1833dc1");
		expect(idempotencyKeyFor("payout:line-42:1")).toBe(
			"61d2f738-ba9c-57c7-bf2e-03fd90e25927",
		);
		expect(idempotencyKeyFor("account:org-7")).toBe(
			"17443694-14ee-5556-83ab-601bf47c3684",
		);
		expect(idempotencyKeyFor("a")).toBe("71089080-09e5-5194-b507-0949de5547cd");
	});

	it("is stable and differs per reference", () => {
		expect(idempotencyKeyFor("x")).toBe(idempotencyKeyFor("x"));
		expect(idempotencyKeyFor("x")).not.toBe(idempotencyKeyFor("y"));
	});
});

describe("Idempotency-Key and Monime-Version headers", () => {
	const client = new MonimeClient({ monimeSpaceId: "spc", accessToken: "tok" });

	beforeEach(() => {
		fetchMock.mockReset();
	});

	it("sends the caller's key unchanged", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		const key = idempotencyKeyFor("transfer:1");
		await client.internalTransfer.create(transfer, { idempotencyKey: key });
		expect(header("Idempotency-Key")).toBe(key);
	});

	it("generates a key when none is given", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.internalTransfer.create(transfer);
		expect(header("Idempotency-Key")).toMatch(/^[0-9a-f]{40}$/);
	});

	it("refuses an empty or over-long key before any request", async () => {
		for (const idempotencyKey of ["", "k".repeat(65)]) {
			const result = await client.internalTransfer.create(transfer, {
				idempotencyKey,
			});
			expect(result.success).toBe(false);
			expect(result.error).toBeInstanceOf(MonimeValidationError);
			expect(result.error?.message).toContain("1 to 64 characters");
		}
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("accepts a 64-character key", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		const result = await client.internalTransfer.create(transfer, {
			idempotencyKey: "k".repeat(64),
		});
		expect(result.success).toBe(true);
	});

	it("sends Monime-Version caph.2025-08-23 by default", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.payout.retrieve("pyt-1");
		expect(header("Monime-Version")).toBe("caph.2025-08-23");
	});

	it("sends the configured Monime-Version instead", async () => {
		const pinned = new MonimeClient({
			monimeSpaceId: "spc",
			accessToken: "tok",
			monimeVersion: "caph.2025-06-20",
		});
		fetchMock.mockResolvedValueOnce(ok());
		await pinned.payout.retrieve("pyt-1");
		expect(header("Monime-Version")).toBe("caph.2025-06-20");
	});
});

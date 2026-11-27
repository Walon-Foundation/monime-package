import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonimeClient } from "../../src/client";

// Pins what each request sends against the API spec (caph.2025-08-23):
// several request bodies reject unknown properties, so unset fields must be
// left out rather than sent empty.

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function ok(result: unknown = { id: "x" }) {
	return { ok: true, status: 200, json: async () => ({ result }) };
}

function call() {
	const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
	return {
		url: new URL(url),
		method: init.method,
		body: init.body ? JSON.parse(init.body as string) : undefined,
	};
}

const client = new MonimeClient({ monimeSpaceId: "spc", accessToken: "tok" });

beforeEach(() => {
	fetchMock.mockReset();
});

describe("financial accounts", () => {
	it("create sends reference, description and metadata, and nothing unset", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.financialAccount.create({
			accountName: "Org 7",
			currency: "SLE",
			reference: "org-7",
			metadata: { rapporteur_org: "7" },
		});
		expect(call().body).toEqual({
			name: "Org 7",
			currency: "SLE",
			reference: "org-7",
			metadata: { rapporteur_org: "7" },
		});
	});

	it("retrieve asks for the balance when told to", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.financialAccount.retrieve("fac-1", { withBalance: true });
		expect(call().url.pathname).toBe("/v1/financial-accounts/fac-1");
		expect(call().url.searchParams.get("withBalance")).toBe("true");
	});

	it("retrieve leaves the balance out by default", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.financialAccount.retrieve("fac-1");
		expect(call().url.search).toBe("");
	});

	it("list sends its filters", async () => {
		fetchMock.mockResolvedValueOnce(ok([]));
		await client.financialAccount.list({
			reference: "org-7",
			withBalance: true,
		});
		expect(call().url.searchParams.get("reference")).toBe("org-7");
		expect(call().url.searchParams.get("withBalance")).toBe("true");
	});
});

describe("payouts", () => {
	it("sends the amount as given, in the chosen currency, from the source", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.payout.create({
			amount: 125000,
			currency: "SLE",
			sourceAccount: "fac-org",
			destination: {
				type: "momo",
				providerId: "m17",
				phoneNumber: "+23276123456",
			},
			metadata: { rapporteur_line: "line-1" },
		});
		expect(call().body).toEqual({
			amount: { currency: "SLE", value: 125000 },
			source: { financialAccountId: "fac-org" },
			destination: {
				type: "momo",
				providerId: "m17",
				phoneNumber: "+23276123456",
			},
			metadata: { rapporteur_line: "line-1" },
		});
	});

	it("leaves source out so Monime uses the main account", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.payout.create({
			amount: 500,
			destination: {
				type: "bank",
				providerId: "slb001",
				accountNumber: "0012345",
			},
		});
		expect(call().body).toEqual({
			amount: { currency: "SLE", value: 500 },
			destination: {
				type: "bank",
				providerId: "slb001",
				accountNumber: "0012345",
			},
		});
	});

	it("accepts the real bank and wallet provider IDs", async () => {
		fetchMock.mockResolvedValue(ok());
		for (const destination of [
			{ type: "bank", providerId: "slb007", accountNumber: "1" },
			{ type: "wallet", providerId: "dw001", walletId: "w-1" },
			{ type: "wallet", providerId: "dw001" },
		] as const) {
			const result = await client.payout.create({ amount: 100, destination });
			expect(result.success).toBe(true);
		}
	});

	it("refuses a destination without its required field", async () => {
		const result = await client.payout.create({
			amount: 100,
			destination: { type: "momo", providerId: "m17", phoneNumber: "" },
		});
		expect(result.success).toBe(false);
		expect(result.error?.message).toContain("phoneNumber is required");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("refuses a fractional amount and a third currency", async () => {
		const destination = {
			type: "momo",
			providerId: "m18",
			phoneNumber: "+23277000000",
		} as const;
		expect(
			(await client.payout.create({ amount: 10.5, destination })).success,
		).toBe(false);
		expect(
			(
				await client.payout.create({
					amount: 100,
					currency: "EUR" as "SLE",
					destination,
				})
			).success,
		).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("list sends its filters", async () => {
		fetchMock.mockResolvedValueOnce(ok([]));
		await client.payout.list({
			status: "failed",
			sourceFinancialAccountId: "fac-org",
			limit: 50,
		});
		const { searchParams } = call().url;
		expect(searchParams.get("status")).toBe("failed");
		expect(searchParams.get("sourceFinancialAccountId")).toBe("fac-org");
		expect(searchParams.get("limit")).toBe("50");
	});

	it("update sends metadata only", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.payout.update("pyt-1", { metadata: { stale: null } });
		expect(call().method).toBe("PATCH");
		expect(call().body).toEqual({ metadata: { stale: null } });
	});
});

describe("internal transfers", () => {
	it("leaves an empty description out and takes a currency", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.internalTransfer.create({
			sourceAccount: "fac-a",
			destinationAccount: "fac-b",
			amount: 900,
			currency: "USD",
			description: "",
		});
		expect(call().body).toEqual({
			amount: { currency: "USD", value: 900 },
			sourceFinancialAccount: { id: "fac-a" },
			destinationFinancialAccount: { id: "fac-b" },
		});
	});

	it("refuses a description over 150 characters on create", async () => {
		const result = await client.internalTransfer.create({
			sourceAccount: "fac-a",
			destinationAccount: "fac-b",
			amount: 900,
			description: "x".repeat(151),
		});
		expect(result.success).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("allows up to 255 characters on update", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		const result = await client.internalTransfer.update("trn-1", {
			description: "x".repeat(255),
		});
		expect(result.success).toBe(true);
	});
});

describe("payment codes", () => {
	it("list sends ussd_code, mode and status", async () => {
		fetchMock.mockResolvedValueOnce(ok([]));
		await client.paymentCode.list({
			ussdCode: "*715*1#",
			mode: "one_time",
			status: "completed",
		});
		const { searchParams } = call().url;
		expect(searchParams.get("ussd_code")).toBe("*715*1#");
		expect(searchParams.get("mode")).toBe("one_time");
		expect(searchParams.get("status")).toBe("completed");
	});

	it("update converts amounts and keeps null", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.paymentCode.update("pmc-1", {
			amount: { value: 2000 },
			reference: null,
		});
		expect(call().body).toEqual({
			amount: { currency: "SLE", value: 2000 },
			reference: null,
		});
	});
});

describe("receipts", () => {
	it("redeem returns { redeem, receipt }", async () => {
		fetchMock.mockResolvedValueOnce(
			ok({
				redeem: true,
				receipt: {
					status: "partially_redeemed",
					orderNumber: "ORD-1",
					orderName: null,
					orderAmount: { currency: "SLE", value: 1000 },
					createTime: "2026-11-27T10:00:00Z",
					updateTime: "2026-11-27T10:05:00Z",
					entitlements: null,
					metadata: null,
				},
			}),
		);
		const result = await client.receipt.redeem("ORD-1", {
			entitlements: [{ key: "lunch", units: 1 }],
		});
		expect(result.data?.redeem).toBe(true);
		expect(result.data?.receipt.status).toBe("partially_redeemed");
		expect(call().url.pathname).toBe("/v1/receipts/ORD-1/redeem");
		expect(call().body).toEqual({ entitlements: [{ key: "lunch", units: 1 }] });
	});

	it("refuses an order number over 20 characters", async () => {
		const result = await client.receipt.redeem("O".repeat(21), {
			redeemAll: true,
		});
		expect(result.success).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe("USSD OTPs", () => {
	it("create sends the optional fields the API accepts", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.ussdOtp.create({
			authorizedPhoneNumber: "+23276123456",
			verificationMessage: "You are signed in.",
			duration: "2m",
			metadata: { session: "s-1" },
		});
		expect(call().body).toEqual({
			authorizedPhoneNumber: "+23276123456",
			verificationMessage: "You are signed in.",
			duration: "2m",
			metadata: { session: "s-1" },
		});
	});
});

describe("webhooks", () => {
	it("create defaults apiRelease to caph and allows ES256 with no secret", async () => {
		fetchMock.mockResolvedValueOnce(
			ok({
				id: "whk-1",
				verificationMethod: {
					type: "ES256",
					publicKey: "-----BEGIN PUBLIC KEY-----",
				},
			}),
		);
		const result = await client.webhook.create({
			name: "Payouts",
			url: "https://example.com/webhooks/monime",
			events: ["payout.completed", "payout.failed"],
			verificationMethod: { type: "ES256" },
		});
		expect(result.success).toBe(true);
		expect(call().body).toEqual({
			name: "Payouts",
			url: "https://example.com/webhooks/monime",
			events: ["payout.completed", "payout.failed"],
			verificationMethod: { type: "ES256" },
			apiRelease: "caph",
		});
	});

	it("create refuses an HS256 secret under 32 characters", async () => {
		const result = await client.webhook.create({
			name: "Payouts",
			url: "https://example.com/hook",
			events: ["payout.completed"],
			verificationMethod: { type: "HS256", secret: "short" },
		});
		expect(result.success).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("update refuses a verification method, which the API cannot change", async () => {
		const result = await client.webhook.update("whk-1", {
			verificationMethod: { type: "ES256" },
		} as never);
		expect(result.success).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("update sends apiRelease", async () => {
		fetchMock.mockResolvedValueOnce(ok());
		await client.webhook.update("whk-1", {
			apiRelease: "caph",
			enabled: false,
		});
		expect(call().body).toEqual({ apiRelease: "caph", enabled: false });
	});
});

describe("payments and ledger", () => {
	it("payment list sends its filters", async () => {
		fetchMock.mockResolvedValueOnce(ok([]));
		await client.payment.list({
			financialAccountId: "fac-1",
			orderNumber: "ORD-1",
		});
		const { searchParams } = call().url;
		expect(searchParams.get("financialAccountId")).toBe("fac-1");
		expect(searchParams.get("orderNumber")).toBe("ORD-1");
	});

	it("financial transaction list sends its filters", async () => {
		fetchMock.mockResolvedValueOnce(ok([]));
		await client.financialTransaction.list({
			financialAccountId: "fac-1",
			type: "debit",
			after: "cur-1",
		});
		const { searchParams } = call().url;
		expect(searchParams.get("financialAccountId")).toBe("fac-1");
		expect(searchParams.get("type")).toBe("debit");
		expect(searchParams.get("after")).toBe("cur-1");
	});
});

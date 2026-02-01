import { describe, expect, it } from "vitest";
import { MonimeClient } from "../../src/client";

describe("MonimeClient Initialization", () => {
	const config = {
		monimeSpaceId: "test-space",
		accessToken: "test-token",
	};

	it("should initialize all resource namespaces correctly", () => {
		const client = new MonimeClient(config);

		expect(client.payment).toBeDefined();
		expect(client.payout).toBeDefined();
		expect(client.financialAccount).toBeDefined();
		expect(client.internalTransfer).toBeDefined();
		expect(client.paymentCode).toBeDefined();
		expect(client.webhook).toBeDefined();
		expect(client.receipt).toBeDefined();
		expect(client.ussdOtp).toBeDefined();
		expect(client.providerKyc).toBeDefined();
		expect(client.financialTransaction).toBeDefined();
		expect(client.checkoutSession).toBeDefined();
		expect(client.financialProvider.bank).toBeDefined();
		expect(client.financialProvider.momo).toBeDefined();
	});

	it("should throw error if monimeSpaceId is missing", () => {
		expect(() => new MonimeClient({ accessToken: "token" } as any)).toThrow(
			"'monimeSpaceId' is missing",
		);
	});

	it("should throw error if accessToken is missing", () => {
		expect(() => new MonimeClient({ monimeSpaceId: "space" } as any)).toThrow(
			"'accessToken' is missing",
		);
	});

	it("should use environment variables if options are empty", () => {
		process.env.MONIME_SPACE_ID = "env-space";
		process.env.MONIME_ACCESS_TOKEN = "env-token";

		const client = new MonimeClient();
		expect(client).toBeDefined();

		delete process.env.MONIME_SPACE_ID;
		delete process.env.MONIME_ACCESS_TOKEN;
	});
});

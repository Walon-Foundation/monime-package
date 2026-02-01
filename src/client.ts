import { CheckoutSessionAPI } from "./resources/checkoutSession";
import { FinancialAccountAPI } from "./resources/financialAccount";
import { BankAPI } from "./resources/bank";
import { MomoAPI } from "./resources/momo";
import { FinancialTransactionAPI } from "./resources/financialTransaction";
import { InternalTransferAPI } from "./resources/internalTransfer";
import { PaymentAPI } from "./resources/payment";
import { PaymentCodeAPI } from "./resources/paymentCode";
import { PayoutAPI } from "./resources/payout";
import { ProviderKycAPI } from "./resources/providerKyc";
import { ReceiptAPI } from "./resources/receipt";
import { UssdOtpAPI } from "./resources/ussdOtp";
import { WebhookAPI } from "./resources/webhook";
import type { ClientConfig } from "./types";

export interface ClientOptions {
	monimeSpaceId?: string;
	accessToken?: string;
	monimeVersion?: "caph.2025-08-23" | "caph.2025-06-20";
}

export class MonimeClient {
	public financialAccount: FinancialAccountAPI;
	public internalTransfer: InternalTransferAPI;
	public paymentCode: PaymentCodeAPI;
	public payment: PaymentAPI;
	public payout: PayoutAPI;
	public providerKyc: ProviderKycAPI;
	public receipt: ReceiptAPI;
	public ussdOtp: UssdOtpAPI;
	public webhook: WebhookAPI;
	public financialTransaction: FinancialTransactionAPI;
	public checkoutSession: CheckoutSessionAPI;
	public financialProvider: {
		bank: BankAPI;
		momo: MomoAPI;
	};

	constructor(options: ClientOptions = {}) {
		const monimeSpaceId = options.monimeSpaceId || process.env.MONIME_SPACE_ID;
		const accessToken = options.accessToken || process.env.MONIME_ACCESS_TOKEN;
		const monimeVersion = options.monimeVersion || process.env.MONIME_VERSION;

		if (!monimeSpaceId || monimeSpaceId.trim() === "") {
			throw new Error(
				"\n[Monime SDK] Configuration Error: 'monimeSpaceId' is missing.\n" +
					"To fix this, either:\n" +
					"  1. Pass it to the constructor: new MonimeClient({ monimeSpaceId: 'your-space-id' })\n" +
					"  2. Set the environment variable: MONIME_SPACE_ID=your-space-id\n" +
					"You can find your Space ID in the Monime Dashboard (https://monime.io).\n"
			);
		}

		if (!accessToken || accessToken.trim() === "") {
			throw new Error(
				"\n[Monime SDK] Configuration Error: 'accessToken' is missing.\n" +
					"To fix this, either:\n" +
					"  1. Pass it to the constructor: new MonimeClient({ accessToken: 'your-access-token' })\n" +
					"  2. Set the environment variable: MONIME_ACCESS_TOKEN=your-access-token\n" +
					"Generate your Access Token in the Monime Dashboard settings.\n"
			);
		}

		const config: ClientConfig = {
			monimeSpaceId,
			accessToken,
			monimeVersion: monimeVersion as string | undefined,
		};

		this.financialAccount = new FinancialAccountAPI(config);
		this.internalTransfer = new InternalTransferAPI(config);
		this.paymentCode = new PaymentCodeAPI(config);
		this.payment = new PaymentAPI(config);
		this.payout = new PayoutAPI(config);
		this.providerKyc = new ProviderKycAPI(config);
		this.receipt = new ReceiptAPI(config);
		this.ussdOtp = new UssdOtpAPI(config);
		this.webhook = new WebhookAPI(config);
		this.financialTransaction = new FinancialTransactionAPI(config);
		this.checkoutSession = new CheckoutSessionAPI(config);
		this.financialProvider = {
			bank: new BankAPI(config),
			momo: new MomoAPI(config),
		};
	}
}

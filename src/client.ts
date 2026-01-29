import { CheckoutSessionAPI } from "./modules/checkoutSession";
import { FinancialAccountAPI } from "./modules/financialAccount";
import { FinancialTransactionAPI } from "./modules/financialTransaction";
import { InternalTransferAPI } from "./modules/internalTransfer";
import { PaymentAPI } from "./modules/payment";
import { PaymentCodeAPI } from "./modules/paymentCode";
import { PayoutAPI } from "./modules/payout";
import { ProviderKycAPI } from "./modules/providerKyc";
import { ReceiptAPI } from "./modules/receipt";
import { UssdOtpAPI } from "./modules/ussdOtp";
import { WebhookAPI } from "./modules/webhook";
import { BankAPI } from "./modules/financialProvider/bank";
import { MomoAPI } from "./modules/financialProvider/momo";

export interface ClientOptions {
	monimeSpaceId: string;
	accessToken: string;
	monimeVersion?: "caph.2025-08-23" | "caph.2025-06-20";
}

export class MonimeClient {
	private monimeSpaceId: string;
	private accessToken: string;
	private monimeVersion?: string | undefined;

	public financialAccount: ReturnType<typeof FinancialAccountAPI>;
	public internalTransfer: ReturnType<typeof InternalTransferAPI>;
	public paymentCode: ReturnType<typeof PaymentCodeAPI>;
	public payment: ReturnType<typeof PaymentAPI>;
	public payout: ReturnType<typeof PayoutAPI>;
	public providerKyc: ReturnType<typeof ProviderKycAPI>;
	public receipt: ReturnType<typeof ReceiptAPI>;
	public ussdOtp: ReturnType<typeof UssdOtpAPI>;
	public webhook: ReturnType<typeof WebhookAPI>;
	public financialTransaction: ReturnType<typeof FinancialTransactionAPI>;
	public checkoutSession: ReturnType<typeof CheckoutSessionAPI>;
	public financialProvider: {
		bank: ReturnType<typeof BankAPI>;
		momo: ReturnType<typeof MomoAPI>;
	};

	constructor(options: ClientOptions) {
		this.accessToken = options.accessToken;
		this.monimeSpaceId = options.monimeSpaceId;
		this.monimeVersion = options.monimeVersion;

		const config = {
			monimeSpaceId: this.monimeSpaceId,
			accessToken: this.accessToken,
			monimeVersion: this.monimeVersion,
		};

		this.financialAccount = FinancialAccountAPI(config);
		this.internalTransfer = InternalTransferAPI(config);
		this.paymentCode = PaymentCodeAPI(config);
		this.payment = PaymentAPI(config);
		this.payout = PayoutAPI(config);
		this.providerKyc = ProviderKycAPI(config);
		this.receipt = ReceiptAPI(config);
		this.ussdOtp = UssdOtpAPI(config);
		this.webhook = WebhookAPI(config);
		this.financialTransaction = FinancialTransactionAPI(config);
		this.checkoutSession = CheckoutSessionAPI(config);
		this.financialProvider = {
			bank: BankAPI(config),
			momo: MomoAPI(config),
		};
	}
}

import { CheckoutSessionAPI } from "./modules/checkout session";
import { FinancialAccountAPI } from "./modules/financialAccount";
import { FinancialTransactionAPI } from "./modules/financialTransaction";
import { InternalTransferAPI } from "./modules/internalTransfer";
import { PaymentCodeAPI } from "./modules/paymentCode";
import { PayoutAPI } from "./modules/payout";

export interface ClientOptions {
	monimeSpaceId: string;
	accessToken: string;
}

export class MonimeClient {
	private monimeSpaceId: string;
	private accessToken: string;

	public financialAccount: ReturnType<typeof FinancialAccountAPI>;
	public internalTransfer: ReturnType<typeof InternalTransferAPI>;
	public paymentCode: ReturnType<typeof PaymentCodeAPI>;
	public payout: ReturnType<typeof PayoutAPI>;
	public financialTransaction: ReturnType<typeof FinancialTransactionAPI>;
	public checkoutSession: ReturnType<typeof CheckoutSessionAPI>;

	constructor(options: ClientOptions) {
		this.accessToken = options.accessToken;
		this.monimeSpaceId = options.monimeSpaceId;

		this.financialAccount = FinancialAccountAPI(this);
		this.internalTransfer = InternalTransferAPI(this);
		this.paymentCode = PaymentCodeAPI(this);
		this.payout = PayoutAPI(this);
		this.financialTransaction = FinancialTransactionAPI(this);
		this.checkoutSession = CheckoutSessionAPI(this);
	}

	/** @internal */
	_getConfig() {
		return {
			monimeSpaceId: this.monimeSpaceId,
			accessToken: this.accessToken,
		};
	}
}

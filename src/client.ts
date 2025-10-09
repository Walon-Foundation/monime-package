import {
	createFinancialAccount,
	getFinancialAccount,
	getAllFinancialAccount
} from "./modules/financialAccount/financialAccount";
import { createInternalTransfer,getAllInternalTransfers, getInternalTransfer, deleteInternalTransfer } from "./modules/internalTransfer/internalTransfer";
import {
	createPaymentCode,
	deletePaymentCode,
} from "./modules/paymentCode/paymentCode";
import { CreatePayoutMobileMoney } from "./modules/payout/payout";
import type {
	AllFinancialAccount,
	AllInternalTransfers,
	CreateFinancialAccount,
	CreateInternalTransfer,
	CreatePaymentCode,
	CreatePayout,
	GetFinancialAccount,
	InternalTransfer,
	DeleteTransfer
} from "./modules/types";

export interface ClientOptions {
	monimeSpaceeId: string;
	accessToken: string;
}

export class MonimeClient {
	private monimeSpaceId: string;
	private accessToken: string;

	/* Methods */

	//method for financial accounts
	createFinancialAccount: (name: string) => Promise<{
		success: boolean;
		data?: CreateFinancialAccount;
		error?: Error;
	}>;
	getFinancialAccount: (
		financialAccountId: string,
	) => Promise<{ success: boolean; data?: GetFinancialAccount; error?: Error }>;

	getAllFinancialAccount:(
	) => Promise<{ success:boolean, data?:AllFinancialAccount, error?:Error}>

	//method for internal transfer
	createInternalTransfer: (
		sourceAccount: string,
		destinationAccount: string,
		amount: number,
	) => Promise<{
		success: boolean;
		data?: CreateInternalTransfer;
		error?: Error;
	}>;
	getInternalTransfer: (
		internalTransferId:string
	) => Promise<{ success:boolean, data?:InternalTransfer, error?:Error}>;
	getAllInternalTransfer: (
	) => Promise<{ success:boolean, data?:AllInternalTransfers, error?:Error}>;
	deleteInternalTransfer:(
		internalTransferId:string
	) => Promise<{ success:boolean, data?:DeleteTransfer, error?:Error}>;

	//method for payment code
	createPaymentCode: (
		paymentName: string,
		amount: number,
		financialAccount: string,
		username: string,
		phoneNumber: string,
	) => Promise<{ success: boolean; error?: Error; data?: CreatePaymentCode }>;
	deletePaymentCode: (
		paymentCodeId: string,
	) => Promise<{ success: boolean; error?: Error; data?: CreatePaymentCode }>;

	//method for payout
	createPayout: (
		amount: number,
		phoneNumber: string,
		sourceAccount: string,
	) => Promise<{ success: boolean; error?: Error; data?: CreatePayout }>;

	constructor(options: ClientOptions) {
		this.accessToken = options.accessToken;
		this.monimeSpaceId = options.monimeSpaceeId;

		this.createFinancialAccount = (name: string) =>
			createFinancialAccount(name, this);
		this.getFinancialAccount = (financialAccountId: string) =>
			getFinancialAccount(financialAccountId, this);
		this.createInternalTransfer = (
			sourceAccount: string,
			destinationAccount: string,
			amount: number,
		) =>
			createInternalTransfer(sourceAccount, destinationAccount, this, amount);
		this.createPaymentCode = (
			paymentName: string,
			amount: number,
			financialAccount: string,
			username: string,
			phoneNumber: string,
		) =>
			createPaymentCode(
				paymentName,
				amount,
				financialAccount,
				username,
				phoneNumber,
				this,
			);
		this.deletePaymentCode = (paymentCodeId: string) =>
			deletePaymentCode(paymentCodeId, this);
		this.createPayout = (
			amount: number,
			phoneNumber: string,
			sourceAccount: string,
		) => CreatePayoutMobileMoney(amount, phoneNumber, sourceAccount, this);
		this.getAllFinancialAccount = () => getAllFinancialAccount(this)
		this.getAllInternalTransfer = () => getAllInternalTransfers(this);
		this.getInternalTransfer = (internalFinancialId) => getInternalTransfer(this, internalFinancialId);
		this.deleteInternalTransfer = (internalFinancialId) => deleteInternalTransfer(this, internalFinancialId)
	}

	/** @internal */
	_getConfig() {
		return {
			monimeSpaceId: this.monimeSpaceId,
			accessToken: this.accessToken,
		};
	}
}

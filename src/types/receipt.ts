export interface Receipt {
	orderNumber: string;
	[key: string]: unknown;
}

export interface GetReceiptResponse extends Receipt {}

export interface RedeemReceiptResponse extends Receipt {}

export interface Receipt {
	orderNumber: string;
	[key: string]: any;
}

export interface GetReceiptResponse extends Receipt {}

export interface RedeemReceiptResponse extends Receipt {}

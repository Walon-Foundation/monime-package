export interface Receipt {
	orderNumber: string;
	[key: string]: any;
}

export interface GetReceiptResponse {
	success: boolean;
	messages: string[];
	result: Receipt;
}

export interface RedeemReceiptResponse {
	success: boolean;
	messages: string[];
	result: Receipt;
}

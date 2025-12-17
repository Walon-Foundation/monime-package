export interface Payment {
	id: string;
	status: "pending" | "processing" | "completed" | "failed";
	amount: {
		currency: string;
		value: number;
	};
	channel: {
		type: "bank" | "card" | "momo" | "wallet";
	};
	name: string | null;
	reference: string | null;
	orderNumber: string | null;
	financialAccountId: string | null;
	financialTransactionReference: string | null;
	fees: Array<{
		code: string;
		amount: {
			currency: string;
			value: number;
		};
	}>;
	createTime: string;
	updateTime: string;
	ownershipGraph: {
		owner: {
			id: string;
			type: string;
			metadata: Record<string, any> | null;
		};
	};
	metadata: Record<string, any> | null;
}

export interface GetPayment {
	success: boolean;
	messages: string[];
	result: Payment;
}

export interface ListPayments {
	success: boolean;
	messages: string[];
	result: Payment[];
	pagination: {
		next: string | null;
	};
}

export interface PatchPayment {
	success: boolean;
	messages: string[];
	result: Payment;
}

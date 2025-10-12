export interface CreatePaymentCode {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
	id: string;
	mode: string;
	status: string;
	name: string;
	amount: {
		currency: string;
		value: number;
	};
	enable: boolean;
	expireTime: string;
	customer: {
		name: string;
	};
	ussdCode: string;
	reference: string;
	authorizedProviders: string[];
	authorizedPhoneNumber: string;
	recurrentPaymentTarget: {
		expectedPaymentCount: number;
		expectedPaymentTotal: {
			currency: string;
			value: number;
		};
	};
	financialAccountId: string;
	processedPaymentData: ProcessedPaymentData;
	createTime: string;
	updateTime: string;
	ownershipGraph: OwnershipGraph;
	// metadata: {};
}

interface OwnershipGraph {
	owner: {
		id: string;
		type: string;
		// metadata: {};
		owner: {
			id: string;
			type: string;
			// metadata: {};
			// owner: {};
		};
	};
}

interface ProcessedPaymentData {
	amount: {
		currency: string;
		value: number;
	};
	orderId: string;
	paymentId: string;
	orderNumber: string;
	channelData: {
		providerId: string;
		accountId: string;
		reference: string;
	};
	financialTransactionReference: string;
	// metadata: {};
}

//-------------------------------------------------------------------------------------
export interface GetAllPaymentCode {
	success: boolean;
	messages: string[];
	result: Result[];
	pagination: Pagination;
}

interface Pagination {
	count: number;
	next: string;
}

interface Result {
	id: string;
	mode: string;
	status: string;
	name: string;
	amount: Amount;
	enable: boolean;
	expireTime: string;
	customer: Customer;
	ussdCode: string;
	reference: string;
	authorizedProviders: string[];
	authorizedPhoneNumber: string;
	recurrentPaymentTarget: RecurrentPaymentTarget;
	financialAccountId: string;
	processedPaymentData: ProcessedPaymentData;
	createTime: string;
	updateTime: string;
	ownershipGraph: OwnershipGraph;
	//   metadata: Metadata;
}

interface OwnershipGraph {
	owner: Owner2;
}

interface Owner2 {
	id: string;
	type: string;
	//   metadata: Metadata;
	owner: Owner;
}

interface Owner {
	id: string;
	type: string;
	//   metadata: Metadata;
	//   owner: Metadata;
}

interface ProcessedPaymentData {
	amount: Amount;
	orderId: string;
	paymentId: string;
	orderNumber: string;
	channelData: ChannelData;
	financialTransactionReference: string;
	//   metadata: Metadata;
}

interface ChannelData {
	providerId: string;
	accountId: string;
	reference: string;
}

interface RecurrentPaymentTarget {
	expectedPaymentCount: number;
	expectedPaymentTotal: Amount;
}

interface Customer {
	name: string;
}

interface Amount {
	currency: string;
	value: number;
}

//-------------------------------------------------------------------------------------------------

export interface GetOne {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
	id: string;
	mode: string;
	status: string;
	name: string;
	amount: Amount;
	enable: boolean;
	expireTime: string;
	customer: Customer;
	ussdCode: string;
	reference: string;
	authorizedProviders: string[];
	authorizedPhoneNumber: string;
	recurrentPaymentTarget: RecurrentPaymentTarget;
	financialAccountId: string;
	processedPaymentData: ProcessedPaymentData;
	createTime: string;
	updateTime: string;
	ownershipGraph: OwnershipGraph;
	//   metadata: Metadata;
}

interface OwnershipGraph {
	owner: Owner2;
}

interface Owner2 {
	id: string;
	type: string;
	//   metadata: Metadata;
	owner: Owner;
}

interface Owner {
	id: string;
	type: string;
	//   metadata: Metadata;
	//   owner: Metadata;
}

interface ProcessedPaymentData {
	amount: Amount;
	orderId: string;
	paymentId: string;
	orderNumber: string;
	channelData: ChannelData;
	financialTransactionReference: string;
	//   metadata: Metadata;
}

interface ChannelData {
	providerId: string;
	accountId: string;
	reference: string;
}

interface RecurrentPaymentTarget {
	expectedPaymentCount: number;
	expectedPaymentTotal: Amount;
}

interface Customer {
	name: string;
}

interface Amount {
	currency: string;
	value: number;
}

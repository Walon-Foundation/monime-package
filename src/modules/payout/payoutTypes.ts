export type DestinationOption =
	| {
			type: "momo";
			providerId: "m17" | "m18";
			phoneNumber: string;
	  }
	| {
			type: "bank";
			providerId: "b01" | "b02" | "b03";
			accountNumber: string;
	  }
	| {
			type: "wallet";
			providerId: "w01" | "w02";
			walletId: string;
	  };

export interface CreatePayout {
	id: string;
	status: string;
	amount: Amount;
	source: Source;
	destination: Destination;
	fees: Fee[];
	failureDetail: FailureDetail;
	createTime: string;
	updateTime: string;
	ownershipGraph: OwnershipGraph;
	// metadata: Metadata;
}



interface OwnershipGraph {
	owner: Owner2;
}

interface Owner2 {
	id: string;
	type: string;
	// metadata: Metadata;
	owner: Owner;
}

interface Owner {
	id: string;
	type: string;
	// metadata: Metadata;
	// owner: Metadata;
}

interface FailureDetail {
	code: string;
	message: string;
}

interface Fee {
	code: string;
	amount: Amount;
	// metadata: Metadata;
}

interface Destination {
	type: string;
	providerId: string;
	accountNumber: string;
	transactionReference: string;
}

interface Source {
	financialAccountId: string;
	transactionReference: string;
}

interface Amount {
	currency: string;
	value: number;
}

//---------------------------------------------------------------------------------------------

export interface GetAll {
	result: Payout[];
	pagination: Pagination;
}

interface Pagination {
	count: number;
	next: string;
}

interface Payout {
	id: string;
	status: string;
	amount: Amount;
	source: Source;
	destination: Destination;
	fees: Fee[];
	failureDetail: FailureDetail;
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

interface FailureDetail {
	code: string;
	message: string;
}

interface Fee {
	code: string;
	amount: Amount;
	//   metadata: Metadata;
}

interface Destination {
	type: string;
	providerId: string;
	accountNumber: string;
	transactionReference: string;
}

interface Source {
	financialAccountId: string;
	transactionReference: string;
}

interface Amount {
	currency: string;
	value: number;
}

//----------------------------------------------------------------------------------------------

export interface GetOnePayout {
	id: string;
	status: string;
	amount: Amount;
	source: Source;
	destination: Destination;
	fees: Fee[];
	failureDetail: FailureDetail;
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

interface FailureDetail {
	code: string;
	message: string;
}

interface Fee {
	code: string;
	amount: Amount;
	//   metadata: Metadata;
}

interface Destination {
	type: string;
	providerId: string;
	accountNumber: string;
	transactionReference: string;
}

interface Source {
	financialAccountId: string;
	transactionReference: string;
}

interface Amount {
	currency: string;
	value: number;
}
